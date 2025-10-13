package game

type Worm struct {
	ID        int          `json:"id"`
	Name      string       `json:"name"`
	Length    int          `json:"length"`
	Hits      int          `json:"hits"`
	IsDead    bool         `json:"isDead"`
	Positions []Coordinate `json:"positions"`
}

func NewArmy() []*Worm {
	return []*Worm{
		{Name: "General C. Crawlington", Length: 5, ID: -1, Hits: 0, IsDead: false},
		{Name: "Major Slitherford", Length: 4, ID: -2, Hits: 0, IsDead: false},
		{Name: "Captain Coilton", Length: 3, ID: -3, Hits: 0, IsDead: false},
		{Name: "Sarge Wiggles", Length: 3, ID: -4, Hits: 0, IsDead: false},
		{Name: "Private Squirmley", Length: 2, ID: -5, Hits: 0, IsDead: false},
	}
}
