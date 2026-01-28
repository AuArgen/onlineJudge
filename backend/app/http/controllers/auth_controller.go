package controllers

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"onlineJudge/backend/app/models"
	"onlineJudge/backend/database"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var googleOauthConfig *oauth2.Config

func InitOauth() {
	googleOauthConfig = &oauth2.Config{
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URI"),
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}
}

// GoogleLogin godoc
// @Summary Get Google OAuth URL
// @Description Returns the URL to redirect the user for Google Login
// @Tags Auth
// @Produce json
// @Success 200 {object} map[string]string
// @Router /auth/google/url [get]
func GoogleLogin(c *fiber.Ctx) error {
	if googleOauthConfig == nil {
		InitOauth()
	}
	url := googleOauthConfig.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	return c.JSON(fiber.Map{"url": url})
}

type GoogleCallbackRequest struct {
	Code string `json:"code"`
}

type AuthResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// GoogleCallback godoc
// @Summary Handle Google OAuth Callback
// @Description Exchanges code for token and returns JWT
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body GoogleCallbackRequest true "Auth Code"
// @Success 200 {object} AuthResponse
// @Failure 400 {object} map[string]string
// @Router /auth/google/callback [post]
func GoogleCallback(c *fiber.Ctx) error {
	if googleOauthConfig == nil {
		InitOauth()
	}

	var req GoogleCallbackRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	token, err := googleOauthConfig.Exchange(context.Background(), req.Code)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Code exchange failed"})
	}

	response, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Failed getting user info"})
	}
	defer response.Body.Close()

	content, _ := ioutil.ReadAll(response.Body)
	var gUser struct {
		ID    string `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	json.Unmarshal(content, &gUser)

	var user models.User
	result := database.DB.Where("email = ?", gUser.Email).First(&user)

	if result.Error != nil {
		user = models.User{
			Name:  gUser.Name,
			Email: gUser.Email,
			Role:  "user",
		}
		database.DB.Create(&user)
	}

	// Update Problem Access (Link pending shares to this user ID)
	database.DB.Model(&models.ProblemAccess{}).
		Where("email = ? AND user_id IS NULL", user.Email).
		Update("user_id", user.ID)

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	}
	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := jwtToken.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	return c.JSON(AuthResponse{
		Token: t,
		User:  user,
	})
}
