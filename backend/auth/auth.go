package auth

import (
	"context"
	"errors"
	"fmt"
	"log"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// AuthPayload represents the structure expected in the "auth" message payload.
type AuthPayload struct {
	Token string `json:"token"`
}

// SupabaseClaims defines the structure of the JWT claims from Supabase.
type SupabaseClaims struct {
	Subject string `json:"sub"` // This is the User ID (UUID)
	jwt.RegisteredClaims
}

// ErrAuthFailed indicates token validation failed.
var ErrAuthFailed = errors.New("authentication failed: invalid token")

// UserData holds the validated user information.
type UserData struct {
	UserID string
	Elo    int
}

// ValidateTokenAndFetchUser validates a Supabase JWT and fetches user data.
// It requires the JWT string, the database pool, and the JWT secret.
// It returns the user's data or an error.
func ValidateTokenAndFetchUser(tokenStr string, dbpool *pgxpool.Pool, jwtSecret string) (*UserData, error) {
	// 1. Validate the JWT
	token, err := jwt.ParseWithClaims(tokenStr, &SupabaseClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Ensure the signing method is HMAC as expected
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		// Return the secret key from environment variables or config
		return []byte(jwtSecret), nil
	})
	if err != nil {
		// Check for specific validation errors vs. general parsing errors
		if errors.Is(err, jwt.ErrTokenMalformed) {
			return nil, fmt.Errorf("malformed token: %w", err)
		} else if errors.Is(err, jwt.ErrTokenExpired) || errors.Is(err, jwt.ErrTokenNotValidYet) {
			return nil, fmt.Errorf("token expired or not valid yet: %w", err)
		}
		// Handle other parsing errors
		return nil, fmt.Errorf("token parsing error: %w", err)
	}

	claims, ok := token.Claims.(*SupabaseClaims)
	if !ok || !token.Valid {
		return nil, ErrAuthFailed
	}

	// 2. Extract User ID
	userID := claims.Subject
	if userID == "" {
		return nil, fmt.Errorf("user ID (sub) not found in token claims")
	}

	// 3. Fetch ELO from Database
	var elo int
	query := "SELECT elo FROM profiles WHERE id = $1"
	// Use a background context (consider using request context if available)
	dbErr := dbpool.QueryRow(context.Background(), query, userID).Scan(&elo)
	if dbErr != nil {
		log.Printf("Error fetching profile for user %s: %v", userID, dbErr)
		// Return a more specific error if needed, e.g., distinguish "not found"
		return nil, fmt.Errorf("could not fetch user profile: %w", dbErr)
	}

	// 4. Return validated user data
	userData := &UserData{
		UserID: userID,
		Elo:    elo,
	}

	return userData, nil // Success
}
