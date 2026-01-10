package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"onlineJudge/config"
	"onlineJudge/database"
	"onlineJudge/models"
	"os"
	"time"
)

// GetUser retrieves the full User object from the cookie
func GetUser(r *http.Request) *models.User {
	cookie, err := r.Cookie("user_email")
	if err != nil {
		return nil
	}
	email, _ := url.QueryUnescape(cookie.Value)

	var user models.User
	result := database.DB.Where("email = ?", email).First(&user)

	if result.Error != nil {
		// Record not found or DB error, treat as not logged in
		return nil
	}
	return &user
}

// GetUserName is kept for backward compatibility but uses GetUser
func GetUserName(r *http.Request) string {
	user := GetUser(r)
	if user != nil {
		return user.Name
	}
	return ""
}

func HandleGoogleLogin(w http.ResponseWriter, r *http.Request) {
	url := config.GoogleOauthConfig.AuthCodeURL(config.OauthStateString)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func HandleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	content, err := getUserInfo(r.FormValue("state"), r.FormValue("code"))
	if err != nil {
		fmt.Println(err.Error())
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	var gUser models.GoogleUser
	err = json.Unmarshal(content, &gUser)
	if err != nil {
		fmt.Println("Error unmarshalling user info:", err)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	// Determine Role
	role := "user"
	adminEmail := os.Getenv("ADMIN_EMAIL")
	if adminEmail != "" && gUser.Email == adminEmail {
		role = "admin"
	}

	// Save or Update User in DB using GORM
	var user models.User
	result := database.DB.Where("email = ?", gUser.Email).First(&user)

	if result.Error != nil {
		// Create new user
		user = models.User{
			GoogleID: gUser.ID,
			Email:    gUser.Email,
			Name:     gUser.Name,
			Role:     role,
		}
		database.DB.Create(&user)
	} else {
		// Update existing user
		user.Name = gUser.Name
		user.GoogleID = gUser.ID
		// If user is supposed to be admin but isn't, upgrade them
		if role == "admin" && user.Role != "admin" {
			user.Role = "admin"
		}
		database.DB.Save(&user)
	}

	// Set cookie with Email
	encodedEmail := url.QueryEscape(gUser.Email)
	cookie := &http.Cookie{
		Name:    "user_email",
		Value:   encodedEmail,
		Expires: time.Now().Add(24 * time.Hour),
		Path:    "/",
	}
	http.SetCookie(w, cookie)

	// Redirect to home page instead of showing welcome template directly
	// This ensures proper template loading with header/footer
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func getUserInfo(state string, code string) ([]byte, error) {
	if state != config.OauthStateString {
		return nil, fmt.Errorf("invalid oauth state")
	}

	token, err := config.GoogleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("code exchange failed: %s", err.Error())
	}

	response, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("failed getting user info: %s", err.Error())
	}
	defer response.Body.Close()

	contents, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("failed reading response body: %s", err.Error())
	}

	return contents, nil
}
