package database

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Profile represents the public data for a single user.
type Profile struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Elo      int    `json:"elo"`
}

// FetchProfile retrieves a user's public profile from the database.
func FetchProfile(dbpool *pgxpool.Pool, userID string) (*Profile, error) {
	var profile Profile
	query := "SELECT id, username, elo FROM profiles WHERE id = $1"

	err := dbpool.QueryRow(context.Background(), query, userID).Scan(&profile.UserID, &profile.Username, &profile.Elo)
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

// FetchLeaderboard retrieves the top N players ordered by ELO.
func FetchLeaderboard(dbpool *pgxpool.Pool, limit int) ([]Profile, error) {
	var leaderboard []Profile
	query := "SELECT id, username, elo FROM profiles ORDER BY elo DESC LIMIT $1"

	rows, err := dbpool.Query(context.Background(), query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var profile Profile
		if err := rows.Scan(&profile.UserID, &profile.Username, &profile.Elo); err != nil {
			return nil, err
		}
		leaderboard = append(leaderboard, profile)
	}

	return leaderboard, nil
}
