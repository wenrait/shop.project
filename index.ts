import path from 'path';

require('dotenv').config();
import express, { Express } from 'express';
import { Connection } from 'mysql2/promise';
import { initServer } from './Server/services/server';
import { initDataBase } from './Server/services/db';
import ShopAPI from './Shop.API';
import ShopAdmin from './Shop.Admin';
export let server: Express;
export let connection: Connection | null;
async function launchApplication() {
  server = initServer();
  connection = await initDataBase();

  initRouter();
}
function initRouter() {
  const shopApi = ShopAPI(connection);
  server.use('/api', shopApi);
  const shopAdmin = ShopAdmin();
  server.use('/admin', shopAdmin);
  server.use(express.static(__dirname + '/Shop.Client/dist'));

  server.get('/*', (_, res) => {
    res.sendFile(path.join(__dirname, '/Shop.Client/dist', 'index.html'));
  });
}

launchApplication();
