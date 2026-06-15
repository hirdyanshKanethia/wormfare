package auth

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"sync"

	"backend/db"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
)

var (
	jwks     keyfunc.Keyfunc
	jwksOnce sync.Once
)

// InitJWKS initializes the JWKS key function from the Supabase URL.
func InitJWKS() {
	jwksOnce.Do(func() {
		supabaseURL := os.Getenv("SUPABASE_URL")
		if supabaseURL == "" {
			log.Println("[AUTH] Warning: SUPABASE_URL not set, ES256 validation may fail.")
			return
		}
		jwksURL := fmt.Sprintf("%s/auth/v1/.well-known/jwks.json", supabaseURL)
		
		var err error
		jwks, err = keyfunc.NewDefault([]string{jwksURL})
		if err != nil {
			log.Fatalf("[AUTH] Failed to initialize JWKS: %v", err)
		}
		log.Printf("[AUTH] JWKS initialized from %s", jwksURL)
	})
}

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

// ValidateTokenAndFetchUser validates a Supabase JWT and fetches user data using Prisma.
func ValidateTokenAndFetchUser(tokenStr string, client *db.PrismaClient, jwtSecret string) (*UserData, error) {
	// 1. Validate the JWT
	token, err := jwt.ParseWithClaims(tokenStr, &SupabaseClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Handle different signing methods
		switch token.Method.(type) {
		case *jwt.SigningMethodHMAC:
			return []byte(jwtSecret), nil
		case *jwt.SigningMethodECDSA:
			if jwks == nil {
				return nil, errors.New("JWKS not initialized for ES256")
			}
			return jwks.Keyfunc(token)
		default:
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
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

	// 3. Fetch ELO from Database using Prisma
	p, dbErr := client.Profile.FindUnique(
		db.Profile.ID.Equals(userID),
	).Exec(context.Background())

	if dbErr != nil {
		log.Printf("Error fetching profile for user %s: %v", userID, dbErr)
		return nil, fmt.Errorf("could not fetch user profile: %w", dbErr)
	}

	// 4. Return validated user data
	userData := &UserData{
		UserID: p.ID,
		Elo:    p.Elo,
	}

	return userData, nil // Success
}
