// Simple import script - save your CSV files as:
// ./data/agencies.csv
// ./data/contacts.csv

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function importAgenciesFromCSV(filePath) {
  const agencies = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        agencies.push(data);
      })
      .on('end', async () => {
        try {
          console.log(`Importing ${agencies.length} agencies...`);
          
          for (const agency of agencies) {
            await prisma.agency.create({
              data: {
                name: agency.name,
                state: agency.state,
                stateCode: agency.state_code || agency.stateCode,
                type: agency.type,
                population: parseInt(agency.population) || 0,
                website: agency.website || null,
                county: agency.county || null,
              },
            });
          }
          
          console.log('Agencies imported successfully!');
          resolve(agencies.length);
        } catch (error) {
          console.error('Error importing agencies:', error);
          reject(error);
        }
      });
  });
}

async function importContactsFromCSV(filePath, defaultClerkUserId) {
  const contacts = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        contacts.push(data);
      })
      .on('end', async () => {
        try {
          console.log(`Importing ${contacts.length} contacts...`);
          
          for (const contact of contacts) {
            await prisma.contact.create({
              data: {
                name: contact.name,
                email: contact.email || null,
                phone: contact.phone || null,
                agency: contact.agency || null,
                position: contact.position || null,
                clerkUserId: defaultClerkUserId,
              },
            });
          }
          
          console.log('Contacts imported successfully!');
          resolve(contacts.length);
        } catch (error) {
          console.error('Error importing contacts:', error);
          reject(error);
        }
      });
  });
}

async function runImport() {
  try {
    // Check if files exist
    if (fs.existsSync('./data/agencies.csv')) {
      await importAgenciesFromCSV('./data/agencies.csv');
    } else {
      console.log('agencies.csv not found in ./data/ folder');
    }
    
    // Import contacts (replace 'your-clerk-user-id' with your actual user ID)
    if (fs.existsSync('./data/contacts.csv')) {
      await importContactsFromCSV('./data/contacts.csv', 'your-clerk-user-id');
    } else {
      console.log('contacts.csv not found in ./data/ folder');
    }
    
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runImport();