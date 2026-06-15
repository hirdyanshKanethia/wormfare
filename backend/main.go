package main

import (
	"log"
	"net/http"
	"os"

	"backend/auth"     // Import auth
	"backend/database" // Import database
	"backend/db"
	"backend/ws"

	"github.com/gin-contrib/cors" // Import CORS middleware
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// --- Setup ---
	godotenv.Load()
	
	// Initialize JWKS for ES256 validation
	auth.InitJWKS()

	client := db.NewClient()
	if err := client.Prisma.Connect(); err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer func() {
		if err := client.Prisma.Disconnect(); err != nil {
			log.Fatalf("Unable to disconnect from database: %v\n", err)
		}
	}()

	log.Println("Successfully connected to database via Prisma.")

	manager := ws.NewManager(client)
	router := gin.Default()

	// --- CORS Middleware ---
	configCORS := cors.DefaultConfig()
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173" // Default for local dev
	}
	configCORS.AllowOrigins = []string{frontendURL}
	configCORS.AllowMethods = []string{"GET", "POST"}
	configCORS.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	router.Use(cors.New(configCORS))

	// --- WebSocket Route ---
	router.GET("/game/ws", func(c *gin.Context) {
		ws.ServeWs(manager, c)
	})

	// --- API Routes ---
	api := router.Group("/api")
	{
		// Public route for the leaderboard
		api.GET("/leaderboard", func(c *gin.Context) {
			leaderboard, err := database.FetchLeaderboard(client, 10) // Get top 10
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch leaderboard"})
				return
			}
			c.JSON(http.StatusOK, leaderboard)
		})

		// Protected routes group
		authed := api.Group("/")
		authed.Use(auth.AuthMiddleware()) // Apply the bouncer
		{
			// Protected route to get the current user's profile
			authed.GET("/profile", func(c *gin.Context) {
				userID, exists := c.Get("userID")
				if !exists {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found in context"})
					return
				}

				profile, err := database.FetchProfile(client, userID.(string))
				if err != nil {
					c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
					return
				}
				c.JSON(http.StatusOK, profile)
			})
		}
	}

	router.Run(":8080")
}
