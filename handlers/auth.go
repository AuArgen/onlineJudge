package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"net/http"
	"net/url"
	"onlineJudge/config"
	"onlineJudge/database"
	"onlineJudge/models"
	"time"
)

// GetUser retrieves the full User object from the cookie
func GetUser(r *http.Request) *models.User {
	cookie, err := r.Cookie("user_email") // Changed to use email as key
	if err != nil {
		return nil
	}
	email, _ := url.QueryUnescape(cookie.Value)

	var user models.User
	err = database.DB.QueryRow("SELECT id, google_id, email, name, role FROM users WHERE email = $1", email).
		Scan(&user.ID, &user.GoogleID, &user.Email, &user.Name, &user.Role)

	if err != nil {
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

	// Save or Update User in DB
	var dbUser models.User
	err = database.DB.QueryRow("SELECT id, role FROM users WHERE email = $1", gUser.Email).Scan(&dbUser.ID, &dbUser.Role)

	if err == sql.ErrNoRows {
		// Create new user
		err = database.DB.QueryRow("INSERT INTO users (google_id, email, name, role) VALUES ($1, $2, $3, 'user') RETURNING id, role",
			gUser.ID, gUser.Email, gUser.Name).Scan(&dbUser.ID, &dbUser.Role)
	} else if err == nil {
		// Update existing user name if changed
		_, err = database.DB.Exec("UPDATE users SET name = $1, google_id = $2 WHERE email = $3", gUser.Name, gUser.ID, gUser.Email)
	}

	if err != nil {
		fmt.Println("Database error:", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Set cookie with Email (more unique than name)
	encodedEmail := url.QueryEscape(gUser.Email)
	cookie := &http.Cookie{
		Name:    "user_email",
		Value:   encodedEmail,
		Expires: time.Now().Add(24 * time.Hour),
		Path:    "/",
	}
	http.SetCookie(w, cookie)

	// Also set user_name for compatibility with existing templates if needed,
	// but better to switch to user object in templates
	encodedName := url.QueryEscape(gUser.Name)
	cookieName := &http.Cookie{
		Name:    "user_name",
		Value:   encodedName,
		Expires: time.Now().Add(24 * time.Hour),
		Path:    "/",
	}
	http.SetCookie(w, cookieName)

	tmpl := template.Must(template.ParseFiles("templates/welcome.html"))
	tmpl.Execute(w, gUser)
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
