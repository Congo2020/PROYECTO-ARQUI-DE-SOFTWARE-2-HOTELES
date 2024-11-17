package search

import (
	"context"
	"fmt"
	hotelsDAO "search-api/dao/hotels"
	hotelsDomain "search-api/domain/hotels"
)

//Funciones de solr
type Repository interface {
	Index(ctx context.Context, hotel hotelsDAO.Hotel) (string, error)
	Update(ctx context.Context, hotel hotelsDAO.Hotel) error
	Delete(ctx context.Context, id string) error
	Search(ctx context.Context, query string, limit int, offset int) ([]hotelsDAO.Hotel, error) // Updated signature
}

// Funcion de la API de hoteles
type ExternalRepository interface {
	GetHotelByID(ctx context.Context, id string) (hotelsDomain.Hotel, error)
}

type Service struct {
	repository Repository // Este seria nuestro repositorio de solr
	hotelsAPI  ExternalRepository // Este seria nuestro repositorio de la API de hoteles
}

// Funcion para crear un nuevo servicio 
func NewService(repository Repository, hotelsAPI ExternalRepository) Service {
	return Service{
		repository: repository,
		hotelsAPI:  hotelsAPI,
	}
}


// Funcion para buscar hoteles en Solr
func (service Service) Search(ctx context.Context, query string, offset int, limit int) ([]hotelsDomain.Hotel, error) {
	// Llama al metodo Search del repositorio
	hotelsDAOList, err := service.repository.Search(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("error searching hotels: %w", err)
	}

	// Hace un mapeo de los hoteles de la lista de hoteles de la base de datos a la lista de hoteles del dominio
	hotelsDomainList := make([]hotelsDomain.Hotel, 0)
	for _, hotel := range hotelsDAOList {
		hotelsDomainList = append(hotelsDomainList, hotelsDomain.Hotel{
			ID:        hotel.ID,
			Name:      hotel.Name,
			Address:   hotel.Address,
			City:      hotel.City,
			State:     hotel.State,
			Rating:    hotel.Rating,
			Amenities: hotel.Amenities,
		})
	}

	// Devuelve la lista de hoteles 
	return hotelsDomainList, nil
}


// Funcion para manejar la creacion y eliminacion de hoteles
func (service Service) HandleHotelNew(hotelNew hotelsDomain.HotelNew) {
	// Hacemos un switch para manejar las operaciones de creacion, actualizacion y eliminacion
	switch hotelNew.Operation {
	// Caso en el que se crea o actualiza un hotel
	case "CREATE", "UPDATE":
		// Obtenemos el hotel de la API de hoteles
		hotel, err := service.hotelsAPI.GetHotelByID(context.Background(), hotelNew.HotelID)
		if err != nil {
			fmt.Printf("Error getting hotel (%s) from API: %v\n", hotelNew.HotelID, err)
			return
		}

		hotelDAO := hotelsDAO.Hotel{
			ID:        hotel.ID,
			Name:      hotel.Name,
			Address:   hotel.Address,
			City:      hotel.City,
			State:     hotel.State,
			Rating:    hotel.Rating,
			Amenities: hotel.Amenities,
		}

		// Caso en el que se crea un hotel
		if hotelNew.Operation == "CREATE" {
			// Llama al metodo Index del repositorio para indexar el hotel en Solr
			if _, err := service.repository.Index(context.Background(), hotelDAO); err != nil {
				fmt.Printf("Error indexing hotel (%s): %v\n", hotelNew.HotelID, err)
			} else {
				fmt.Println("Hotel indexed successfully:", hotelNew.HotelID)
			}
		} else { // Caso en el que se actualiza un hotel
			// Llama al metodo Update del repositorio para actualizar el hotel en Solr
			if err := service.repository.Update(context.Background(), hotelDAO); err != nil {
				fmt.Printf("Error updating hotel (%s): %v\n", hotelNew.HotelID, err)
			} else {
				fmt.Println("Hotel updated successfully:", hotelNew.HotelID)
			}
		}
	
	// Caso en el que se elimina un hotel
	case "DELETE":
		// Llama al metodo Delete del repositorio para eliminar el hotel de Solr
		if err := service.repository.Delete(context.Background(), hotelNew.HotelID); err != nil {
			fmt.Printf("Error deleting hotel (%s): %v\n", hotelNew.HotelID, err)
		} else {
			fmt.Println("Hotel deleted successfully:", hotelNew.HotelID)
		}

	default:
		fmt.Printf("Unknown operation: %s\n", hotelNew.Operation)
	}
}
