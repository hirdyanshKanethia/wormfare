package database

import (
	"context"
	"backend/db"
)

// Profile represents the public data for a single user.
type Profile struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Elo      int    `json:"elo"`
}

// FetchProfile retrieves a user's public profile from the database using Prisma.
func FetchProfile(client *db.PrismaClient, userID string) (*Profile, error) {
	p, err := client.Profile.FindUnique(
		db.Profile.ID.Equals(userID),
	).Exec(context.Background())

	if err != nil {
		return nil, err
	}

	username := ""
	if u, ok := p.Username(); ok {
		username = u
	}

	return &Profile{
		UserID:   p.ID,
		Username: username,
		Elo:      p.Elo,
	}, nil
}

// FetchLeaderboard retrieves the top N players ordered by ELO using Prisma.
func FetchLeaderboard(client *db.PrismaClient, limit int) ([]Profile, error) {
	profiles, err := client.Profile.FindMany().
		OrderBy(db.Profile.Elo.Order(db.SortOrderDesc)).
		Take(limit).
		Exec(context.Background())

	if err != nil {
		return nil, err
	}

	var leaderboard []Profile
	for _, p := range profiles {
		username := ""
		if u, ok := p.Username(); ok {
			username = u
		}
		leaderboard = append(leaderboard, Profile{
			UserID:   p.ID,
			Username: username,
			Elo:      p.Elo,
		})
	}

	return leaderboard, nil
}
