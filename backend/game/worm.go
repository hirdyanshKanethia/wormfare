package game

type Coordinate struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type Worm struct {
	Name      string       `json:"name"`
	Length    int          `json:"length"`
	Positions []Coordinate `json:"-"`
	Hits      int          `json:"hits"`
	IsSunk    bool         `json:"isSunk"`
}

func NewArmy() []*Worm {
	return []*Worm{
		{Name: "General C. Crawlington", Length: 5},
		{Name: "Major Slitherford", Length: 4},
		{Name: "Captain Coilton", Length: 3},
		{Name: "Sarge Wiggles", Length: 3},
		{Name: "Private Squirmley", Length: 2},
	}
}
