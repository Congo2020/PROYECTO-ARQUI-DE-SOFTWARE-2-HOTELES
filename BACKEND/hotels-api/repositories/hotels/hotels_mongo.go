package hotels

import (
	"context"
	"fmt"
	hotelsDAO "hotels-api/dao/hotels"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoConfig struct {
	Host       string
	Port       string
	Username   string
	Password   string
	Database   string
	Collection_hotels string
	Collection_reservations string
}

type Mongo struct {
	client     *mongo.Client
	database   string
	collection_hotel string
	collection_reservation string
}

const (
	connectionURI = "mongodb://%s:%s"
)


//Crea una nueva instancia de Mongo
func NewMongo(config MongoConfig) Mongo {
	credentials := options.Credential{
		Username: config.Username,
		Password: config.Password,
	}

	//Crea el contexto
	ctx := context.Background()
	//Crea la URI de conexion
	uri := fmt.Sprintf(connectionURI, config.Host, config.Port)
	//Crea la configuracion de conexion
	cfg := options.Client().ApplyURI(uri).SetAuth(credentials)

	//Crea la conexion a MongoDB
	client, err := mongo.Connect(ctx, cfg)
	if err != nil {
		log.Panicf("error connecting to mongo DB: %v", err)
	}

	return Mongo{
		client:     client,
		database:   config.Database,
		collection_hotel: config.Collection_hotels,
		collection_reservation: config.Collection_reservations,
	}
}

//Obtiene un hotel por su ID de MongoDB
func (repository Mongo) GetHotelByID(ctx context.Context, id string) (hotelsDAO.Hotel, error) {

	//Crea el ObjectID de MongoDB a partir del ID para buscar el documento
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return hotelsDAO.Hotel{}, fmt.Errorf("error converting id to mongo ID: %w", err)
	}

	// Buscar el documento en MongoDB por su ID
	result := repository.client.Database(repository.database).Collection(repository.collection_hotel).FindOne(ctx, bson.M{"_id": objectID})
	if result.Err() != nil {
		return hotelsDAO.Hotel{}, fmt.Errorf("error finding document: %w", result.Err())
	}

	// Decodificar el resultado
	var hotelDAO hotelsDAO.Hotel
	if err := result.Decode(&hotelDAO); err != nil {
		return hotelsDAO.Hotel{}, fmt.Errorf("error decoding result: %w", err)
	}
	return hotelDAO, nil
}

//Crea un nuevo hotel en MongoDB
func (repository Mongo) Create(ctx context.Context, hotel hotelsDAO.Hotel) (string, error) {
	// Insertar el documento en MongoDB
	result, err := repository.client.Database(repository.database).Collection(repository.collection_hotel).InsertOne(ctx, hotel)
	if err != nil {
		return "", fmt.Errorf("error creating document: %w", err)
	}

	// Saca el ObjectID del resultado de la insercion
	objectID, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		return "", fmt.Errorf("error converting mongo ID to object ID")
	}

	// Regresa el ID del documento insertado
	return objectID.Hex(), nil
}


//Actualiza un hotel en MongoDB
func (repository Mongo) Update(ctx context.Context, hotel hotelsDAO.Hotel) error {
	// Convert hotel ID to MongoDB ObjectID
	objectID, err := primitive.ObjectIDFromHex(hotel.ID)
	if err != nil {
		return fmt.Errorf("error converting id to mongo ID: %w", err)
	}

	// Crea un mapa con los campos a actualizar
	update := bson.M{}

	// Actualiza solo los campos que no son cero o vacios
	if hotel.Name != "" {
		update["name"] = hotel.Name
	}
	if hotel.Address != "" {
		update["address"] = hotel.Address
	}
	if hotel.City != "" {
		update["city"] = hotel.City
	}
	if hotel.State != "" {
		update["state"] = hotel.State
	}
	if hotel.Rating != 0 { // Asumiendo que 0 es el valor por defecto para Rating
		update["rating"] = hotel.Rating
	}
	if len(hotel.Amenities) > 0 { // Asumiendo que un slice vacio es el valor por defecto para Amenities
		update["amenities"] = hotel.Amenities
	}

	// Actualiza el documento en MongoDB
	if len(update) == 0 {
		return fmt.Errorf("no fields to update for hotel ID %s", hotel.ID)
	}

	// Saca el objectID del documento y actualiza los campos en MongoDB
	filter := bson.M{"_id": objectID}
	result, err := repository.client.Database(repository.database).Collection(repository.collection_hotel).UpdateOne(ctx, filter, bson.M{"$set": update})
	if err != nil {
		return fmt.Errorf("error updating document: %w", err)
	}
	if result.MatchedCount == 0 {
		return fmt.Errorf("no document found with ID %s", hotel.ID)
	}
	
	return nil
}

//Elimina un hotel de MongoDB
func (repository Mongo) Delete(ctx context.Context, id string) error {
	// Convert hotel ID to MongoDB ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("error converting id to mongo ID: %w", err)
	}

	// Elimina el documento de MongoDB
	filter := bson.M{"_id": objectID}
	result, err := repository.client.Database(repository.database).Collection(repository.collection_hotel).DeleteOne(ctx, filter)
	if err != nil {
		return fmt.Errorf("error deleting document: %w", err)
	}
	if result.DeletedCount == 0 {
		return fmt.Errorf("no document found with ID %s", id)
	}

	return nil
}
