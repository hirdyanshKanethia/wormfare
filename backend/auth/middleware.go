package auth

import (
	"fmt" // Import fmt
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware creates a Gin middleware that validates a Supabase JWT.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Bearer token required"})
			return
		}

		// Validate the token
		token, err := jwt.ParseWithClaims(tokenString, &SupabaseClaims{}, func(token *jwt.Token) (interface{}, error) {
			secret := os.Getenv("SUPABASE_JWT_SECRET")
			switch token.Method.(type) {
			case *jwt.SigningMethodHMAC:
				return []byte(secret), nil
			case *jwt.SigningMethodECDSA:
				if jwks == nil {
					return nil, fmt.Errorf("JWKS not initialized for ES256")
				}
				return jwks.Keyfunc(token)
			default:
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		if claims, ok := token.Claims.(*SupabaseClaims); ok {
			// Add the user ID to the context for the next handler to use
			c.Set("userID", claims.Subject)
			c.Next()
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}
	}
}
