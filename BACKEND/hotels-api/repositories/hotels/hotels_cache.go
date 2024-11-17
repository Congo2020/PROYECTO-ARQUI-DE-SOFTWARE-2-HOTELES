package hotels

import (
	"context"
	"fmt"
	hotelsDAO "hotels-api/dao/hotels"
	"time"

	"github.com/karlseguin/ccache"
)

const (
	keyFormat = "hotel:%s"
)

type CacheConfig struct {
	MaxSize      int64
	ItemsToPrune uint32
	Duration     time.Duration
}

type Cache struct {
	client   *ccache.Cache
	duration time.Duration
}


//Crea una nueva instancia de Cache
func NewCache(config CacheConfig) Cache {
	client := ccache.New(ccache.Configure().
		MaxSize(config.MaxSize).
		ItemsToPrune(config.ItemsToPrune))
	return Cache{
		client:   client,
		duration: config.Duration,
	}
}

//Obtiene un hotel por su ID de la cache
func (repository Cache) GetHotelByID(ctx context.Context, id string) (hotelsDAO.Hotel, error) {
	//Crea la llave para buscar el hotel
	key := fmt.Sprintf(keyFormat, id)
	//Obtiene el item de la cache
	item := repository.client.Get(key)
	//Si no se encuentra el item, regresa un error
	if item == nil {
		return hotelsDAO.Hotel{}, fmt.Errorf("not found item with key %s", key)
	}
	//Si el item esta expirado, regresa un error
	if item.Expired() {
		return hotelsDAO.Hotel{}, fmt.Errorf("item with key %s is expired", key)
	}
	hotelDAO, ok := item.Value().(hotelsDAO.Hotel)
	if !ok {
		return hotelsDAO.Hotel{}, fmt.Errorf("error converting item with key %s", key)
	}
	
	
	return hotelDAO, nil
}

//Crea un nuevo hotel en la cache
func (repository Cache) Create(ctx context.Context, hotel hotelsDAO.Hotel) (string, error) {
	key := fmt.Sprintf(keyFormat, hotel.ID)
	//Guarda el hotel en la cache
	repository.client.Set(key, hotel, repository.duration)
	return hotel.ID, nil
}

//Actualiza un hotel en la cache
func (repository Cache) Update(ctx context.Context, hotel hotelsDAO.Hotel) error {
	key := fmt.Sprintf(keyFormat, hotel.ID)

	// Busca el item actual en la cache y regresa un error si no se encuentra o esta expirado
	item := repository.client.Get(key)
	if item == nil {
		return fmt.Errorf("hotel with ID %s not found in cache", hotel.ID)
	}
	if item.Expired() {
		return fmt.Errorf("item with key %s is expired", key)
	}

	// Convierte el item a un hotel
	currentHotel, ok := item.Value().(hotelsDAO.Hotel)
	if !ok {
		return fmt.Errorf("error converting item with key %s", key)
	}

	// Actualiza solo los campos que no son cero o vacios 
	if hotel.Name != "" {
		currentHotel.Name = hotel.Name
	}
	if hotel.Address != "" {
		currentHotel.Address = hotel.Address
	}
	if hotel.City != "" {
		currentHotel.City = hotel.City
	}
	if hotel.State != "" {
		currentHotel.State = hotel.State
	}
	if hotel.Rating != 0 {
		currentHotel.Rating = hotel.Rating
	}
	if len(hotel.Amenities) > 0 {
		currentHotel.Amenities = hotel.Amenities
	}

	// Guarda el hotel actualizado en la cache y reinicia el tiempo de expiracion
	repository.client.Set(key, currentHotel, repository.duration)

	//Devuelve nil si no hay errores
	return nil
}

//Elimina un hotel de la cache
func (repository Cache) Delete(ctx context.Context, id string) error {
	key := fmt.Sprintf(keyFormat, id)
	// Elimina el hotel de la cache
	repository.client.Delete(key)
	return nil
}
