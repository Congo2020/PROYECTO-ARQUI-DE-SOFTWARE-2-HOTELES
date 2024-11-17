package hotels

import (
	"context"
	"fmt"
	hotelsDomain "hotels-api/domain/hotels"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

//Estas son las funciones que se encargan de interactuar con el servicio, se encargan de recibir las peticiones y enviar las respuestas (Vienen del service)
type Service interface {
	GetHotelByID(ctx context.Context, id string) (hotelsDomain.Hotel, error)
	Create(ctx context.Context, hotel hotelsDomain.Hotel) (string, error)
	Update(ctx context.Context, hotel hotelsDomain.Hotel) error
	Delete(ctx context.Context, id string) error
}

type Controller struct {
	service Service
}

func NewController(service Service) Controller {
	return Controller{
		service: service,
	}
}

//Funcion para obtener un hotel por ID (GET)
func (controller Controller) GetHotelByID(ctx *gin.Context) {
	// Valida el ID del hotel que viene en la URL
	hotelID := strings.TrimSpace(ctx.Param("id"))

	// Obtiene el hotel por ID
	hotel, err := controller.service.GetHotelByID(ctx.Request.Context(), hotelID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": fmt.Sprintf("error getting hotel: %s", err.Error()),
		})
		return
	}

	// Devuelve el hotel encontrado
	ctx.JSON(http.StatusOK, hotel)
}


//Funcion para crear un hotel (POST)
func (controller Controller) Create(ctx *gin.Context) {
	// Le da formato al hotel que viene en el body de la peticiona un DAO
	var hotel hotelsDomain.Hotel
	if err := ctx.ShouldBindJSON(&hotel); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("invalid request: %s", err.Error()),
		})
		return
	}

	// Crea el hotel
	id, err := controller.service.Create(ctx.Request.Context(), hotel)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("error creating hotel: %s", err.Error()),
		})
		return
	}

	// Devuelve el ID del hotel creado
	ctx.JSON(http.StatusCreated, gin.H{
		"id": id,
	})
}


//Funcion para actualizar un hotel (PUT)
func (controller Controller) Update(ctx *gin.Context) {
	// Valida el ID del hotel que viene en la URL
	id := strings.TrimSpace(ctx.Param("id"))

	// Le da formato al hotel que viene en el body de la peticiona un DAO
	var hotel hotelsDomain.Hotel
	if err := ctx.ShouldBindJSON(&hotel); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("invalid request: %s", err.Error()),
		})
		return
	}

	// Asigna el ID al hotel
	hotel.ID = id

	// Actualiza el hotel
	if err := controller.service.Update(ctx.Request.Context(), hotel); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("error updating hotel: %s", err.Error()),
		})
		return
	}

	// Devuelve el ID del hotel actualizado
	ctx.JSON(http.StatusOK, gin.H{
		"message": id,
	})
}


//Funcion para eliminar un hotel (DELETE)
func (controller Controller) Delete(ctx *gin.Context) {
	// Valida el ID del hotel que viene en la URL
	id := strings.TrimSpace(ctx.Param("id"))

	// Elimina el hotel
	if err := controller.service.Delete(ctx.Request.Context(), id); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("error deleting hotel: %s", err.Error()),
		})
		return
	}

	// Devuelve el ID del hotel eliminado
	ctx.JSON(http.StatusOK, gin.H{
		"message": id,
	})
}
