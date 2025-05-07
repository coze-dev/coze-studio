package builtin

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
)

func TestChunkCustom(t *testing.T) {
	ctx := context.Background()
	t.Run("test \n no overlap", func(t *testing.T) {
		text := "1. Eiffel Tower: Located in Paris, France, it is one of the most famous landmarks in the world, designed by Gustave Eiffel and built in 1889.\n2. The Great Wall: Located in China, it is one of the Seven Wonders of the World, built from the Qin Dynasty to the Ming Dynasty, with a total length of over 20000 kilometers.\n3. Grand Canyon National Park: Located in Arizona, USA, it is famous for its deep canyons and magnificent scenery, which are cut by the Colorado River.\n4. The Colosseum: Located in Rome, Italy, built between 70-80 AD, it was the largest circular arena in the ancient Roman Empire.\n5. Taj Mahal: Located in Agra, India, it was completed by Mughal Emperor Shah Jahan in 1653 to commemorate his wife and is one of the New Seven Wonders of the World.\n6. Sydney Opera House: Located in Sydney Harbour, Australia, it is one of the most iconic buildings of the 20th century, renowned for its unique sailboat design.\n7. Louvre Museum: Located in Paris, France, it is one of the largest museums in the world with a rich collection, including Leonardo da Vinci's Mona Lisa and Greece's Venus de Milo.\n8. Niagara Falls: located at the border of the United States and Canada, consisting of three main waterfalls, its spectacular scenery attracts millions of tourists every year.\n9. St. Sophia Cathedral: located in Istanbul, Türkiye, originally built in 537 A.D., it used to be an Orthodox cathedral and mosque, and now it is a museum.\n10. Machu Picchu: an ancient Inca site located on the plateau of the Andes Mountains in Peru, one of the New Seven Wonders of the World, with an altitude of over 2400 meters."

		cs := &entity.ChunkingStrategy{
			ChunkType:       entity.ChunkTypeCustom,
			ChunkSize:       1000,
			Separator:       "\n",
			Overlap:         0,
			TrimSpace:       true,
			TrimURLAndEmail: true,
		}

		slices, err := chunkCustom(ctx, text, cs, &entity.Document{
			Info:             common.Info{ID: 123},
			KnowledgeID:      456,
			Type:             entity.DocumentTypeText,
			ChunkingStrategy: cs,
		})

		assert.NoError(t, err)
		assert.Len(t, slices, 10)
	})
}
