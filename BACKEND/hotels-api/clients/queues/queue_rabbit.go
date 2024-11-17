package queues

import (
	"encoding/json"
	"fmt"
	"hotels-api/domain/hotels"
	"log"

	"github.com/streadway/amqp"
)

type RabbitConfig struct {
	Host      string
	Port      string
	Username  string
	Password  string
	QueueName string
}

type Rabbit struct {
	connection *amqp.Connection
	channel    *amqp.Channel
	queue      amqp.Queue
}

// Funcion que crea una nueva instancia de Rabbit
func NewRabbit(config RabbitConfig) Rabbit {
	//Crea la conexion a RabbitMQ
	connection, err := amqp.Dial(fmt.Sprintf("amqp://%s:%s@%s:%s/", config.Username, config.Password, config.Host, config.Port))
	if err != nil {
		log.Fatalf("error getting Rabbit connection: %w", err)
	}
	channel, err := connection.Channel()
	if err != nil {
		log.Fatalf("error creating Rabbit channel: %w", err)
	}
	//Crea la cola en RabbitMQ
	queue, err := channel.QueueDeclare(config.QueueName, false, false, false, false, nil)
	return Rabbit{
		connection: connection,
		channel:    channel,
		queue:      queue,
	}
}

// Funcion que publica un mensaje en RabbitMQ
func (queue Rabbit) Publish(hotelNew hotels.HotelNew) error {
	//Codifica el mensaje a JSON
	bytes, err := json.Marshal(hotelNew)
	if err != nil {
		return fmt.Errorf("error marshaling Rabbit hotelNew: %w", err)
	}
	//Publica el mensaje en RabbitMQ
	if err := queue.channel.Publish(
		"",
		queue.queue.Name,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        bytes,
		}); err != nil {
		return fmt.Errorf("error publishing to Rabbit: %w", err)
	}
	return nil
}

// Funcion que cierra la conexion a RabbitMQ
func (queue Rabbit) Close() {
	if err := queue.channel.Close(); err != nil {
		log.Printf("error closing Rabbit channel: %v", err)
	}
	if err := queue.connection.Close(); err != nil {
		log.Printf("error closing Rabbit connection: %v", err)
	}
}
