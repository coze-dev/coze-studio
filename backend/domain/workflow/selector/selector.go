package selector

import (
	"context"
	"errors"

	"github.com/cloudwego/eino/compose"
)

type Selector struct {
	branch                *compose.GraphBranch
	dependenciesWithInput map[string][]*compose.FieldMapping
	onlyDependencies      []string
	noDirectDependencies  map[string][]*compose.FieldMapping
}

type Config struct {
	Predecessors  []string
	Clauses       []Clause
	DefaultChoice []string
}

func NewSelector(_ context.Context, config *Config) (*Selector, error) {
	if config == nil {
		return nil, errors.New("config is required")
	}

	if len(config.Predecessors) == 0 {
		return nil, errors.New("predecessors is required")
	}

	if len(config.Clauses) == 0 {
		return nil, errors.New("clauses is required")
	}

	if len(config.DefaultChoice) == 0 {
		return nil, errors.New("default choice is required")
	}

	dependenciesWithInput, onlyDependencies, noDirectDependencies := config.extractDependencies()
	endNodes := config.getEndNodes()
	condition := config.createCondition()
	branch := compose.NewGraphMultiBranch(condition, endNodes)
	return &Selector{
		branch:                branch,
		dependenciesWithInput: dependenciesWithInput,
		onlyDependencies:      onlyDependencies,
		noDirectDependencies:  noDirectDependencies,
	}, nil
}

func (c *Config) extractDependencies() (
	dependenciesWithInput map[string][]*compose.FieldMapping,
	onlyDependencies []string,
	noDirectDependencies map[string][]*compose.FieldMapping) {

	type input struct {
		fromNode string
		fm       compose.FieldMapping
	}

	inputs := make(map[input]struct{})
	dependenciesWithInput = make(map[string][]*compose.FieldMapping)
	noDirectDependencies = make(map[string][]*compose.FieldMapping)

	var isPred bool
	for _, clause := range c.Clauses {
		fromNodeKey, fieldMapping := clause.LeftOperant.GetFieldMapping()
		in := input{fromNode: fromNodeKey, fm: *fieldMapping}
		if _, ok := inputs[in]; !ok {
			inputs[in] = struct{}{}
			isPred = false
			for _, pre := range c.Predecessors {
				if pre == fromNodeKey {
					dependenciesWithInput[fromNodeKey] = append(dependenciesWithInput[fromNodeKey], fieldMapping)
				}
				isPred = true
				break
			}

			if !isPred {
				noDirectDependencies[fromNodeKey] = append(noDirectDependencies[fromNodeKey], fieldMapping)
			}
		}

		if clause.RightOperant != nil {
			fromNodeKey, fieldMapping = clause.RightOperant.GetFieldMapping()
			in = input{fromNode: fromNodeKey, fm: *fieldMapping}
			if _, ok := inputs[in]; !ok {
				inputs[in] = struct{}{}
				isPred = false
				for _, pre := range c.Predecessors {
					if pre == fromNodeKey {
						dependenciesWithInput[fromNodeKey] = append(dependenciesWithInput[fromNodeKey], fieldMapping)
						isPred = true
						break
					}
				}

				if !isPred {
					noDirectDependencies[fromNodeKey] = append(noDirectDependencies[fromNodeKey], fieldMapping)
				}
			}
		}
	}

	for _, pre := range c.Predecessors {
		if _, ok := dependenciesWithInput[pre]; !ok {
			if _, ok := noDirectDependencies[pre]; !ok {
				onlyDependencies = append(onlyDependencies, pre)
			}
		}
	}

	return dependenciesWithInput, onlyDependencies, noDirectDependencies
}

func (c *Config) getEndNodes() map[string]bool {
	endNodes := make(map[string]bool)
	for _, c := range c.Clauses {
		for _, endNode := range c.Choices {
			endNodes[endNode] = true
		}
	}

	for _, endNode := range c.DefaultChoice {
		endNodes[endNode] = true
	}

	return endNodes
}

func (c *Config) createCondition() compose.GraphMultiBranchCondition[map[string]any] {
	return func(ctx context.Context, in map[string]any) (map[string]bool, error) {
		for _, clause := range c.Clauses {
			result, err := clause.Resolve(in)
			if err != nil {
				return nil, err
			}

			if result {
				selected := make(map[string]bool, len(clause.Choices))
				for _, choice := range clause.Choices {
					selected[choice] = true
				}
				return selected, nil
			}
		}

		selected := make(map[string]bool, len(c.DefaultChoice))
		for _, choice := range c.DefaultChoice {
			selected[choice] = true
		}

		return selected, nil
	}
}

func (s *Selector) Branch() *compose.GraphBranch {
	return s.branch
}

func (s *Selector) DependenciesWithInput() map[string][]*compose.FieldMapping {
	return s.dependenciesWithInput
}

func (s *Selector) OnlyDependencies() []string {
	return s.onlyDependencies
}

func (s *Selector) NoDirectDependencies() map[string][]*compose.FieldMapping {
	return s.noDirectDependencies
}
