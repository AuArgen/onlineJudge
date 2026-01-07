package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"net/http"
	"net/url"
	"onlineJudge/config"
	"onlineJudge/models"
	"time"
)

// GetUserName retrieves the user name from the cookie, if present.
func GetUserName(r *http.Request) string {
	cookie, err := r.Cookie("user_name")
	if err != nil {
		return ""
	}
	decodedName, err := url.QueryUnescape(cookie.Value)
	if err != nil {
		return cookie.Value
	}
	return decodedName
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

	var user models.GoogleUser
	err = json.Unmarshal(content, &user)
	if err != nil {
		fmt.Println("Error unmarshalling user info:", err)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	// Set a cookie with the user's name
	encodedName := url.QueryEscape(user.Name)
	
	cookie := &http.Cookie{
		Name:    "user_name",
		Value:   encodedName,
		Expires: time.Now().Add(24 * time.Hour),
		Path:    "/",
	}
	http.SetCookie(w, cookie)

	tmpl := template.Must(template.ParseFiles("templates/welcome.html"))
	tmpl.Execute(w, user)
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
