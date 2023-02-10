import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import {
    createEnrollmentWithAddress,
    createUser,
    createHotel,
    createTicket,
    createTicketTypeRemote,
    createTicketTypeWithHotel,
    createRoomWithHotelId,
    createRoomWithoutCapacity
  } from "../factories";


beforeAll(async () => {
  await init();
  await prisma.address.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.ticketType.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.hotel.deleteMany({});

});



const server = supertest(app);

describe("POST /booking", () => {

   
  it("should respond with status 401 when token is not given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(401);
  });




    it("should respond with status 400 when body is not given", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
       
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    
        expect(response.status).toBe(400);
      });
    
      it("should respond with status 400 when body is invalid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
       
        const invalidBody = {
            roomId: faker.name.findName()
        }
    
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(invalidBody);
    
        expect(response.status).toBe(400);
      });

    
      it("should respond with status 403 when user doesn't have an enrollment", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
    
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: 1});
    
        expect(response.status).toBe(403);
        expect(response.text).toBe("You don't have enrollment yet");
      });

    
      it("should respond with status 403 when user have enrollment but no ticket", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: 1});
    
        
        expect(response.status).toBe(403);
        expect(response.text).toBe("You don't have a valid ticket, make sure you have a ticket that's paid, isn't remote and includes hotel");
      });

      it("should respond with status 403 when user have ticket but it's remote", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        await createTicket(enrollment.id,ticketType.id, "PAID")
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: 1});
    
        
        expect(response.status).toBe(403);
        expect(response.text).toBe("You don't have a valid ticket, make sure you have a ticket that's paid, isn't remote and includes hotel");
      });

      it("should respond with status 403 when user have ticket but isn't paid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(enrollment.id,ticketType.id, "RESERVED")
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: 1});
    
        
        expect(response.status).toBe(403);
        expect(response.text).toBe("You don't have a valid ticket, make sure you have a ticket that's paid, isn't remote and includes hotel");
      });

      it("should respond with status 404 when user have proper ticket but there is no hotel", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(enrollment.id,ticketType.id, "PAID")
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: 1});
    
        
        expect(response.status).toBe(404);
        expect(response.text).toBe("We don't have any available hotels yet");
      });
      
      it("should respond with status 404 when user have proper ticket there is hotel but no room with given ID", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(enrollment.id,ticketType.id, "PAID");
        await createHotel();
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: 1});
    
        
        expect(response.status).toBe(404);
        expect(response.text).toBe("Room with given ID wasn't found");
      });

      
        it("should respond with status 403 when room is out of capacity", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(enrollment.id,ticketType.id, "PAID");
        const hotel = await createHotel();
        const room = await createRoomWithoutCapacity(Number(hotel.id));
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: Number(room.id)});
    
        
        expect(response.status).toBe(403);
        expect(response.text).toBe("The room you select is out of capacity");
      });


      it("should respond with status 201 when user have proper ticket, there is hotel and room with given ID", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(enrollment.id,ticketType.id, "PAID");
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(Number(hotel.id));
        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: Number(room.id)});
    
        
        expect(response.status).toBe(201);
        expect(response.text).toBe(`{\"bookingId\":${response.body.bookingId}}`)
      });
});


describe("GET /booking", () => {

   
    it("should respond with status 401 when token is not given", async () => {
      const response = await server.get("/booking");
  
      expect(response.status).toBe(401);
    });
  
  

    it("should respond with status 404 when user have no booking yet", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);


        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    
        expect(response.status).toBe(404);
    expect(response.text).toBe("You don't have any booking yet");
    });

    it("should respond with status 200 when user have booking", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(enrollment.id,ticketType.id, "PAID");
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(Number(hotel.id));
        const booking = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: Number(room.id)});

        const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
        
        expect(response.status).toBe(200);
    });
});

describe("PUT /booking", () => {

   
    it("should respond with status 401 when token is not given", async () => {
      const response = await server.put("/booking/1");
  
      expect(response.status).toBe(401);
    });
  
  

    it("should respond with status 404 when user have no booking", async () => {
        
        const user = await createUser();
        const token = await generateValidToken(user);


        const response = await server.put("/booking/1239847239472934").set("Authorization", `Bearer ${token}`);

    
        expect(response.status).toBe(404);
    expect(response.text).toBe("You don't have any booking yet");
    });

    describe("When user have booking", () => {

        it("should respond with status 400 when body is invalid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id,ticketType.id, "PAID");
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(Number(hotel.id));
            const booking = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: Number(room.id)});
    
            const invalidBody = {
                parameter: faker.name.middleName()
            }
       
            const response = await server.put(`/booking/${booking.body.id}`).set("Authorization", `Bearer ${token}`).send(invalidBody);
    
        
            expect(response.status).toBe(400);
            expect(response.text).toBe("Your body must contain roomId");
        });
    
        it("should respond with status 404 when body is valid, but there is not room with given id", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id,ticketType.id, "PAID");
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(Number(hotel.id));
            const booking = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({roomId: Number(room.id)});
            const body = {
                roomId: 198198989898
            }
    
    
            const response = await server.put("/booking/1239847239472934").set("Authorization", `Bearer ${token}`).send(body);
    
        
            expect(response.status).toBe(404);
        expect(response.text).toBe("Room with given ID wasn't found");
        });


        it("should respond with status 401 when body is valid, but booking in params doesn't belong to user", async () => {
            
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id,ticketType.id, "PAID");
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(Number(hotel.id));
            const booking = await server.post(`/booking/`).set("Authorization", `Bearer ${token}`).send({roomId: Number(room.id)});
            const body = {
                roomId: room.id
            }
    
    
            const response = await server.put(`/booking/${booking.body.bookingId + 10}`).set("Authorization", `Bearer ${token}`).send(body);
    
        
            expect(response.status).toBe(401);
            expect(response.text).toBe("This booking is from another user");

        });

        it("should respond with status 403 when room in body is without capacity", async () => {
            
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id,ticketType.id, "PAID");
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(Number(hotel.id));
            const booking = await server.post(`/booking`).set("Authorization", `Bearer ${token}`).send({roomId: Number(room.id)});
           
    
            const newRoom = await createRoomWithoutCapacity(hotel.id);
            const body = {
                roomId: newRoom.id
            }

            const response = await server.put(`/booking/${booking.body.bookingId}`).set("Authorization", `Bearer ${token}`).send(body);
    
        
            expect(response.status).toBe(403);
            expect(response.text).toBe("The room you select is out of capacity");

        });

        it("should respond with status 200 when given proper room in body", async () => {
            
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            await createTicket(enrollment.id,ticketType.id, "PAID");
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(Number(hotel.id));
            const booking = await server.post(`/booking`).set("Authorization", `Bearer ${token}`).send({roomId: Number(room.id)});
           
    
            const newRoom = await createRoomWithHotelId(Number(hotel.id));
            const body = {
                roomId: newRoom.id
            }

            const response = await server.put(`/booking/${booking.body.bookingId}`).set("Authorization", `Bearer ${token}`).send(body);
    
        
          
            expect(response.status).toBe(200);
        });
    })
});