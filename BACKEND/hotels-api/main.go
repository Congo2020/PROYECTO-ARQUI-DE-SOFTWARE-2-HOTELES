package main

import (
	"hotels-api/clients/queues"
	controllers "hotels-api/controllers/hotels"
	repositories "hotels-api/repositories/hotels"
	services "hotels-api/services/hotels"
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	// Local cache
	cacheRepository := repositories.NewCache(repositories.CacheConfig{
		MaxSize:      100000,
		ItemsToPrune: 100,
		Duration:     30 * time.Second,
	})

	// Mongo
	mainRepository := repositories.NewMongo(repositories.MongoConfig{
		Host:       "mongo",
		Port:       "27017",
		Username:   "root",
		Password:   "root",
		Database:   "hotels-api",
		Collection_hotels: "hotels",
		Collection_reservations: "reservations",
	})

	// Rabbit
	//Este es el que carga a la cola de rabbit
	eventsQueue := queues.NewRabbit(queues.RabbitConfig{
		Host:      "rabbitmq",
		Port:      "5672",
		Username:  "root",
		Password:  "root",
		QueueName: "hotels-news",
	})

	// Services
	service := services.NewService(mainRepository, cacheRepository, eventsQueue)

	// Controllers
	controller := controllers.NewController(service)

	// Router
	// Rutea las peticiones a los controladores
    router := gin.Default()
    router.GET("/hotels/:hotel_id", controller.GetHotelByID)
    router.POST("/hotels", controller.Create)
    router.PUT("/hotels/:hotel_id", controller.Update)
    router.DELETE("/hotels/:hotel_id", controller.Delete)
    router.POST("/hotels/reservations", controller.CreateReservation)
    router.DELETE("/hotels/reservations/:id", controller.CancelReservation)
    router.GET("/hotels/:hotel_id/reservations", controller.GetReservationsByHotelID)
    router.GET("/users/:user_id/reservations", controller.GetReservationsByUserID)
    router.GET("/users/:user_id/hotels/:hotel_id/reservations", controller.GetReservationsByUserAndHotelID)
    router.GET("/hotels/availability", controller.GetAvailability)
    if err := router.Run(":8081"); err != nil {
        log.Fatalf("error running application: %w", err)
    }
}
