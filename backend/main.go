package main

import (
	"backend/ws" 

	"github.com/gin-gonic/gin"
)

func main() {
	// Create our WebSocket manager
	manager := ws.NewManager()

	// Create a default Gin router
	router := gin.Default()

	// Define the WebSocket route
	router.GET("/ws", func(c *gin.Context) {
		ws.ServeWs(manager, c)
	})

	// Start the server
	router.Run(":8080")
}
