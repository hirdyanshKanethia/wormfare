package game

type Coordinate struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type Worm struct {
	ID        int          `json:"id"`
	Name      string       `json:"name"`
	Length    int          `json:"length"`
	Positions []Coordinate `json:"-"`
	Hits      int          `json:"hits"`
	IsSunk    bool         `json:"isSunk"`
}

func NewArmy() []*Worm {
	return []*Worm{
		{Name: "General C. Crawlington", Length: 5, ID: -1},
		{Name: "Major Slitherford", Length: 4, ID: -2},
		{Name: "Captain Coilton", Length: 3, ID: -3},
		{Name: "Sarge Wiggles", Length: 3, ID: -4},
		{Name: "Private Squirmley", Length: 2, ID: -5},
	}
}
