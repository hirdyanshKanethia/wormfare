package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"backend/auth"     // Import auth
	"backend/database" // Import database
	"backend/ws"

	"github.com/gin-contrib/cors" // Import CORS middleware
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	// --- Setup ---
	godotenv.Load()
	dbpool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v\n", err)
	}
	defer dbpool.Close()
	log.Println("Successfully connected to database.")

	manager := ws.NewManager(dbpool)
	router := gin.Default()

	// --- CORS Middleware ---
	config := cors.DefaultConfig()
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173" // Default for local dev
	}
	config.AllowOrigins = []string{frontendURL}
	config.AllowMethods = []string{"GET", "POST"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	router.Use(cors.New(config))

	// --- WebSocket Route ---
	router.GET("/game/ws", func(c *gin.Context) {
		ws.ServeWs(manager, c)
	})

	// --- API Routes ---
	api := router.Group("/api")
	{
		// Public route for the leaderboard
		api.GET("/leaderboard", func(c *gin.Context) {
			leaderboard, err := database.FetchLeaderboard(dbpool, 10) // Get top 10
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

				profile, err := database.FetchProfile(dbpool, userID.(string))
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
