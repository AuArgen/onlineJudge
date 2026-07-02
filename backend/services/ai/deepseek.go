package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
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
	timeout := 180 * time.Second
	if raw := os.Getenv("DEEPSEEK_TIMEOUT_SECONDS"); raw != "" {
		if secs, err := strconv.Atoi(raw); err == nil && secs > 0 {
			timeout = time.Duration(secs) * time.Second
		}
	}
	return &Client{
		apiKey:  os.Getenv("DEEPSEEK_API_KEY"),
		baseURL: strings.TrimRight(baseURL, "/"),
		model:   model,
		http:    &http.Client{Timeout: timeout},
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

// descriptionFormatGuidance instructs the model to write every problem
// description (base text and each translation) as Markdown with explicit,
// bolded Input/Output/Constraints sections rather than a bare paragraph.
const descriptionFormatGuidance = "Format every \"description\" (base text and each translation) as Markdown with this exact structure: a short narrative paragraph, a blank line, a bolded input-format section header followed by a bullet list describing each input line/value, a blank line, a bolded output-format section header followed by a bullet list describing the output, and a blank line, a bolded constraints section header followed by a bullet list of bounds, each written with backticks (for example, `1 <= N <= 10^6`). Wrap variable names and numbers in backticks throughout. Use these header labels depending on the description's language: Russian - \"**Формат ввода (Input):**\", \"**Формат вывода (Output):**\", \"**Ограничения:**\"; Kyrgyz - \"**Кирүү форматы (Input):**\", \"**Чыгуу форматы (Output):**\", \"**Чектөөлөр:**\"; English - \"**Input format:**\", \"**Output format:**\", \"**Constraints:**\". Every translation must follow this same structure with its own language's headers, not just the base text."

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
1. Correct grammar, spelling and clarity, keeping the statement's original language and meaning intact. If the description is missing its Input format, Output format or Constraints sections, add them (inferring reasonable content from the description) rather than leaving them out.
2. ` + descriptionFormatGuidance + `
3. Translate the corrected statement into Russian (ru), Kyrgyz (ky) and English (en), each faithful in meaning and equally professional in tone.
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
Given a topic, you must draft exactly N distinct, original problem statements at a specific difficulty level, in the style of a well-formed competitive programming problem: a clear title and a description with a story/context followed by Input format, Output format and Constraints sections.
%s
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
The "problems" array must contain exactly N items. Do not include any text outside the JSON object.`, descriptionFormatGuidance, difficulty, rubric[difficulty], difficulty)

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

// ProblemDraft is a single AI-drafted problem statement for the "create
// problem" page, before it has been saved anywhere.
type ProblemDraft struct {
	Title        string                   `json:"title"`
	Description  string                   `json:"description"`
	Difficulty   string                   `json:"difficulty"`
	TimeLimit    float64                  `json:"time_limit"`
	MemoryLimit  int                      `json:"memory_limit"`
	Translations map[string]LocalizedText `json:"translations"` // keys: ru, ky, en
}

// DraftProblem drafts a single problem statement from a free-form idea
// typed by the author, at the requested difficulty, together with ru/ky/en
// translations so the create-problem flow can save them immediately.
func (c *Client) DraftProblem(prompt, difficulty string) (*ProblemDraft, error) {
	rubric := map[string]string{
		"easy":   "easy: relies on basic loops, conditionals, arrays/strings and simple math — solvable by a beginner.",
		"medium": "medium: standard algorithms such as sorting, greedy strategies, basic dynamic programming or basic graph traversal.",
		"hard":   "hard: advanced dynamic programming, advanced graph algorithms, or non-trivial data structures.",
	}

	system := fmt.Sprintf(`You are a professional competitive-programming problem setter working for an online judge platform.
Given a short idea or theme from the author, draft one original, self-contained problem statement in the style of a well-formed competitive programming problem: a clear title and a description with a short story/context followed by Input format, Output format and Constraints sections.
%s
Difficulty rubric for "%s": %s
Write the base title/description in Russian. Also provide translations into Russian (ru), Kyrgyz (ky) and English (en) (the "ru" translation may repeat the base text).
Suggest a reasonable time_limit (seconds, float) and memory_limit (MB, int) for the problem given its difficulty.
Respond with STRICT JSON only, matching exactly this shape:
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
Do not include any text outside the JSON object.`, descriptionFormatGuidance, difficulty, rubric[difficulty], difficulty)

	user := fmt.Sprintf("Idea/theme: %s", prompt)

	raw, err := c.chatCompletion(system, user)
	if err != nil {
		return nil, err
	}

	var result ProblemDraft
	if err := json.Unmarshal([]byte(raw), &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response as JSON: %w", err)
	}
	return &result, nil
}

// TopicSuggestion is an AI-drafted title/description pair for a new topic.
type TopicSuggestion struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

// SuggestTopic drafts a clean topic title and a short overview description
// from a rough idea typed by the author.
func (c *Client) SuggestTopic(prompt string) (*TopicSuggestion, error) {
	system := `You are a curriculum designer for a competitive-programming online judge platform.
Given a rough idea for a learning topic (a chapter/category of problems, e.g. "graphs" or "dynamic programming"), produce:
1. A short, clean, well-formed topic title in Russian.
2. A short overview description (2-4 sentences, Russian) explaining what the topic covers and why it matters, suitable as the topic's introductory text block.
Respond with STRICT JSON only, matching exactly this shape:
{"title": "...", "description": "..."}
Do not include any text outside the JSON object.`

	user := fmt.Sprintf("Idea: %s", prompt)

	raw, err := c.chatCompletion(system, user)
	if err != nil {
		return nil, err
	}

	var result TopicSuggestion
	if err := json.Unmarshal([]byte(raw), &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response as JSON: %w", err)
	}
	return &result, nil
}

// OverviewDraft is an AI-drafted overview text block for an existing topic.
type OverviewDraft struct {
	Content string `json:"content"`
}

// GenerateOverview drafts an overview text block for a topic, given its
// title and any existing content/subtopics as context.
func (c *Client) GenerateOverview(topicTitle, context string) (*OverviewDraft, error) {
	system := `You are a curriculum designer for a competitive-programming online judge platform.
Given a topic's title and any existing content already written for it, draft a clear, well-structured overview text (plain text, a few short paragraphs, Russian) explaining what the topic covers, key ideas/techniques a learner should know, and how it's typically applied. It will be shown as the topic's introductory text block, so it must be self-contained and must not duplicate the existing content verbatim.
Respond with STRICT JSON only, matching exactly this shape:
{"content": "..."}
Do not include any text outside the JSON object.`

	user := fmt.Sprintf("Topic title: %s\nExisting content (may be empty):\n%s", topicTitle, context)

	raw, err := c.chatCompletion(system, user)
	if err != nil {
		return nil, err
	}

	var result OverviewDraft
	if err := json.Unmarshal([]byte(raw), &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response as JSON: %w", err)
	}
	return &result, nil
}
