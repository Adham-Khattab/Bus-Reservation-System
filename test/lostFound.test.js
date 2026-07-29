require('dotenv').config();

const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');

describe('Lost & Found API', () => {

    afterAll(async () => {
        await pool.end();
    });

    test('POST /api/lost-found creates a new item', async () => {
        const res = await request(app)
            .post('/api/lost-found')
            .send({
                description: 'Black backpack left near Sidi Gaber',
                bus_number: 'Bus 1',
                photo_url: 'https://example.com/photo.jpg'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.description).toBe('Black backpack left near Sidi Gaber');
    });

    test('POST /api/lost-found fails without a description', async () => {
        const res = await request(app)
            .post('/api/lost-found')
            .send({ bus_number: 'Bus 1' });

        expect(res.statusCode).toBe(400);
    });

    test('GET /api/lost-found returns an array', async () => {
        const res = await request(app).get('/api/lost-found');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

});