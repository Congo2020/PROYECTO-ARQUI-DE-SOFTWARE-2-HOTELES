package hotels

import (
	"context"
	"fmt"
	hotelsDAO "hotels-api/dao/hotels"
	hotelsDomain "hotels-api/domain/hotels"
)

//Estas funciones salen de los repositorios, se encargan de interactuar tanto de la base de datos como de la cache, ambas tienen las mismas funciones pero con diferentes implementaciones para cada cosa
type Repository interface {
	GetHotelByID(ctx context.Context, id string) (hotelsDAO.Hotel, error)
	Create(ctx context.Context, hotel hotelsDAO.Hotel) (string, error)
	Update(ctx context.Context, hotel hotelsDAO.Hotel) error
	Delete(ctx context.Context, id string) error
}


type Queue interface {
	Publish(hotelNew hotelsDomain.HotelNew) error
}

type Service struct {
	mainRepository  Repository
	cacheRepository Repository
	eventsQueue     Queue
}

//Funcion que se encarga de crear un nuevo servicio con los repositorios y la cola de eventos
func NewService(mainRepository Repository, cacheRepository Repository, eventsQueue Queue) Service {
	return Service{
		mainRepository:  mainRepository,
		cacheRepository: cacheRepository,
		eventsQueue:     eventsQueue,
	}
}

//Funcion que se encarga de obtener un hotel por su ID, primero se intenta obtener de la cache, si no se encuentra se obtiene de la base de datos principal y se guarda en la cache
func (service Service) GetHotelByID(ctx context.Context, id string) (hotelsDomain.Hotel, error) {
	// Se intenta obtener el hotel de la cache
	hotelDAO, err := service.cacheRepository.GetHotelByID(ctx, id)
	if err != nil {
		// Si no se encuentra en la cache, se obtiene de la base de datos principal
		hotelDAO, err = service.mainRepository.GetHotelByID(ctx, id)
		if err != nil {
			return hotelsDomain.Hotel{}, fmt.Errorf("error getting hotel from repository: %v", err)
		}
		// Se guarda el hotel en la cache
		if _, err := service.cacheRepository.Create(ctx, hotelDAO); err != nil {
			return hotelsDomain.Hotel{}, fmt.Errorf("error creating hotel in cache: %w", err)
		}
	}

	// Lo pasa de formato de base de datos a formato de dominio para las respuestas
	//Lo devuelve en formato de dominio
	return hotelsDomain.Hotel{
		ID:        hotelDAO.ID,
		Name:      hotelDAO.Name,
		Address:   hotelDAO.Address,
		City:      hotelDAO.City,
		State:     hotelDAO.State,
		Rating:    hotelDAO.Rating,
		Amenities: hotelDAO.Amenities,
	}, nil
}


//Funcion que se encarga de crear un nuevo hotel, primero se crea en la base de datos principal, luego en la cache y por ultimo se publica un evento para notificar que se creo un nuevo hotel
func (service Service) Create(ctx context.Context, hotel hotelsDomain.Hotel) (string, error) {
	// Convierte el modelo de dominio a modelo DAO
	//Modelo de como viene -> modelo base de datos
	record := hotelsDAO.Hotel{
		Name:      hotel.Name,
		Address:   hotel.Address,
		City:      hotel.City,
		State:     hotel.State,
		Rating:    hotel.Rating,
		Amenities: hotel.Amenities,
	}
	// Crea el hotel en el repositorio principal (base de datos -> MongoDB)
	id, err := service.mainRepository.Create(ctx, record)
	if err != nil {
		return "", fmt.Errorf("error creating hotel in main repository: %w", err)
	}
	// Crea el hotel en el repositorio de cache
	//El id que usan es el ObjectId de MongoDB
	record.ID = id
	if _, err := service.cacheRepository.Create(ctx, record); err != nil {
		return "", fmt.Errorf("error creating hotel in cache: %w", err)
	}
	// Publica un evento para notificar la creación del hotel (RabbitMQ)
	if err := service.eventsQueue.Publish(hotelsDomain.HotelNew{
		Operation: "CREATE",
		HotelID:   id,
	}); err != nil {
		return "", fmt.Errorf("error publishing hotel new: %w", err)
	}

	return id, nil
}

//Funcion que se encarga de actualizar un hotel, primero se actualiza en la base de datos principal, luego en la cache y por ultimo se publica un evento para notificar que se actualizo un hotel
func (service Service) Update(ctx context.Context, hotel hotelsDomain.Hotel) error {
	// Convierte el modelo de dominio a modelo DAO 
	record := hotelsDAO.Hotel{
		ID:        hotel.ID,
		Name:      hotel.Name,
		Address:   hotel.Address,
		City:      hotel.City,
		State:     hotel.State,
		Rating:    hotel.Rating,
		Amenities: hotel.Amenities,
	}

	// Actualiza el hotel en el repositorio principal (MongoDB)
	err := service.mainRepository.Update(ctx, record)
	if err != nil {
		return fmt.Errorf("error updating hotel in main repository: %w", err)
	}

	//INTENTA actualizar el hotel en el repositorio de cache
	if err := service.cacheRepository.Update(ctx, record); err != nil {
		return fmt.Errorf("error updating hotel in cache: %w", err)
	}

	// Publica un evento para notificar la actualización del hotel (RabbitMQ)
	if err := service.eventsQueue.Publish(hotelsDomain.HotelNew{
		Operation: "UPDATE",
		HotelID:   hotel.ID,
	}); err != nil {
		return fmt.Errorf("error publishing hotel update: %w", err)
	}

	return nil
}


//Funcion que se encarga de eliminar un hotel, primero se elimina de la base de datos principal, luego de la cache y por ultimo se publica un evento para notificar que se elimino un hotel
func (service Service) Delete(ctx context.Context, id string) error {
	// Intenta eliminar el hotel del repositorio principal (MongoDB)
	err := service.mainRepository.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("error deleting hotel from main repository: %w", err)
	}

	// Intenta eliminar el hotel del repositorio de cache
	if err := service.cacheRepository.Delete(ctx, id); err != nil {
		return fmt.Errorf("error deleting hotel from cache: %w", err)
	}

	// Publica un evento para notificar la eliminación del hotel (RabbitMQ)
	if err := service.eventsQueue.Publish(hotelsDomain.HotelNew{
		Operation: "DELETE",
		HotelID:   id,
	}); err != nil {
		return fmt.Errorf("error publishing hotel delete: %w", err)
	}

	return nil
}
