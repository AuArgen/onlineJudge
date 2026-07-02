package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// Client talks to a DeepSeek (OpenAI-compatible) chat completions endpoint.
type Client struct {
	apiKey  string
	baseURL string
	model   string
	http    *http.Client
}

// NewClient builds a Client from environment variables, matching the
// direct os.Getenv pattern already used for other secrets in this codebase.
func NewClient() *Client {
	baseURL := os.Getenv("DEEPSEEK_API_URL")
	if baseURL == "" {
		baseURL = "https://api.deepseek.com"
	}
	model := os.Getenv("DEEPSEEK_MODEL")
	if model == "" {
		model = "deepseek-chat"
	}
	return &Client{
		apiKey:  os.Getenv("DEEPSEEK_API_KEY"),
		baseURL: strings.TrimRight(baseURL, "/"),
		model:   model,
		http:    &http.Client{Timeout: 60 * time.Second},
	}
}

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatRequest struct {
	Model          string            `json:"model"`
	Messages       []chatMessage     `json:"messages"`
	Temperature    float64           `json:"temperature"`
	ResponseFormat map[string]string `json:"response_format,omitempty"`
}

type chatResponse struct {
	Choices []struct {
		Message chatMessage `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

func (c *Client) chatCompletion(system, user string) (string, error) {
	if c.apiKey == "" {
		return "", fmt.Errorf("DEEPSEEK_API_KEY is not configured")
	}

	reqBody := chatRequest{
		Model: c.model,
		Messages: []chatMessage{
			{Role: "system", Content: system},
			{Role: "user", Content: user},
		},
		Temperature:    0.4,
		ResponseFormat: map[string]string{"type": "json_object"},
	}
	payload, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to encode request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", c.baseURL+"/chat/completions", bytes.NewReader(payload))
	if err != nil {
		return "", fmt.Errorf("failed to build request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.http.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("failed to reach DeepSeek API: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read DeepSeek response: %w", err)
	}

	var parsed chatResponse
	unmarshalErr := json.Unmarshal(body, &parsed)

	if resp.StatusCode != http.StatusOK {
		if unmarshalErr == nil && parsed.Error != nil {
			return "", fmt.Errorf("DeepSeek API error (status %d): %s", resp.StatusCode, parsed.Error.Message)
		}
		snippet := string(body)
		if len(snippet) > 300 {
			snippet = snippet[:300]
		}
		return "", fmt.Errorf("DeepSeek API returned status %d: %s", resp.StatusCode, snippet)
	}

	if unmarshalErr != nil {
		return "", fmt.Errorf("failed to parse DeepSeek response: %w", unmarshalErr)
	}

	if len(parsed.Choices) == 0 {
		return "", fmt.Errorf("DeepSeek API returned no choices")
	}

	return parsed.Choices[0].Message.Content, nil
}

// LocalizedText holds a title/description pair for a single language.
type LocalizedText struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

// CorrectResult is the output of CorrectAndTranslate.
type CorrectResult struct {
	Corrected    LocalizedText            `json:"corrected"`
	Translations map[string]LocalizedText `json:"translations"` // keys: ru, ky, en
}

// CorrectAndTranslate improves the wording/formatting of a problem statement
// and translates the corrected version into ru, ky and en.
func (c *Client) CorrectAndTranslate(title, description string) (*CorrectResult, error) {
	system := `You are a professional competitive-programming problem setter and translator working for an online judge platform.
Given a draft problem title and description, you must:
1. Correct grammar, spelling, clarity and formatting, keeping the statement's original language and meaning intact. Preserve structure such as "Input format", "Output format", "Constraints" and "Example" sections if present, and any Markdown formatting.
2. Translate the corrected statement into Russian (ru), Kyrgyz (ky) and English (en), each faithful in meaning and equally professional in tone.
Respond with STRICT JSON only, matching exactly this shape:
{
  "corrected": {"title": "...", "description": "..."},
  "translations": {
    "ru": {"title": "...", "description": "..."},
    "ky": {"title": "...", "description": "..."},
    "en": {"title": "...", "description": "..."}
  }
}
Do not include any text outside the JSON object.`

	user := fmt.Sprintf("Title:\n%s\n\nDescription:\n%s", title, description)

	raw, err := c.chatCompletion(system, user)
	if err != nil {
		return nil, err
	}

	var result CorrectResult
	if err := json.Unmarshal([]byte(raw), &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response as JSON: %w", err)
	}
	return &result, nil
}

// GeneratedProblem is a single AI-drafted problem statement.
type GeneratedProblem struct {
	Title        string                   `json:"title"`
	Description  string                   `json:"description"`
	Difficulty   string                   `json:"difficulty"`
	TimeLimit    float64                  `json:"time_limit"`
	MemoryLimit  int                      `json:"memory_limit"`
	Translations map[string]LocalizedText `json:"translations"` // keys: ru, ky, en
}

type generateResponse struct {
	Problems []GeneratedProblem `json:"problems"`
}

// GenerateProblems drafts `count` distinct problem statements related to a
// topic at the requested difficulty, each with ru/ky/en translations.
func (c *Client) GenerateProblems(topicTitle, topicContext string, count int, difficulty string) ([]GeneratedProblem, error) {
	rubric := map[string]string{
		"easy":   "easy: relies on basic loops, conditionals, arrays/strings and simple math — solvable by a beginner.",
		"medium": "medium: standard algorithms such as sorting, greedy strategies, basic dynamic programming or basic graph traversal.",
		"hard":   "hard: advanced dynamic programming, advanced graph algorithms, or non-trivial data structures.",
	}

	system := fmt.Sprintf(`You are a professional competitive-programming problem setter working for an online judge platform.
Given a topic, you must draft exactly N distinct, original problem statements at a specific difficulty level, in the style of a well-formed competitive programming problem: a clear title, a description with a story/context, "Input format", "Output format", "Constraints" and at least one worked "Example" (input/output shown as plain text within the description, not as executable test data).
Difficulty rubric for "%s": %s
Each problem must be genuinely distinct from the others (different core idea/technique), appropriate for the given difficulty, and self-contained.
Write the base title/description in Russian. Also provide translations into Russian (ru), Kyrgyz (ky) and English (en) of each problem (the "ru" translation may repeat the base text).
Suggest a reasonable time_limit (seconds, float) and memory_limit (MB, int) for each problem given its difficulty.
Respond with STRICT JSON only, matching exactly this shape:
{
  "problems": [
    {
      "title": "...",
      "description": "...",
      "difficulty": "%s",
      "time_limit": 1.0,
      "memory_limit": 256,
      "translations": {
        "ru": {"title": "...", "description": "..."},
        "ky": {"title": "...", "description": "..."},
        "en": {"title": "...", "description": "..."}
      }
    }
  ]
}
The "problems" array must contain exactly N items. Do not include any text outside the JSON object.`, difficulty, rubric[difficulty], difficulty)

	user := fmt.Sprintf("Topic: %s\nAdditional context: %s\nN (number of problems to generate): %d", topicTitle, topicContext, count)

	raw, err := c.chatCompletion(system, user)
	if err != nil {
		return nil, err
	}

	var result generateResponse
	if err := json.Unmarshal([]byte(raw), &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response as JSON: %w", err)
	}
	if len(result.Problems) == 0 {
		return nil, fmt.Errorf("AI returned no problems")
	}
	return result.Problems, nil
}
