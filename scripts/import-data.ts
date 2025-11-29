import { prisma } from '../lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

async function importFromDataFolder() {
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    console.log('Data folder not found');
    return;
  }

  // Import contacts.csv
  const contactsPath = path.join(dataDir, 'contacts.csv');
  if (fs.existsSync(contactsPath)) {
    console.log('Importing contacts.csv...');
    await importContactsCSV(contactsPath);
  }

  // Import agencies.csv  
  const agenciesPath = path.join(dataDir, 'agencies.csv');
  if (fs.existsSync(agenciesPath)) {
    console.log('Importing agencies.csv...');
    await importAgenciesCSV(agenciesPath);
  }
}

async function importContactsCSV(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    let imported = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const contactData: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case 'first_name':
          case 'last_name':
            if (header === 'first_name') {
              contactData.firstName = value;
            } else {
              contactData.lastName = value;
            }
            // Combine first and last name
            contactData.name = `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim();
            break;
          case 'email':
            contactData.email = value;
            break;
          case 'phone':
            contactData.phone = value;
            break;
          case 'title':
            contactData.position = value;
            break;
          case 'department':
            contactData.department = value;
            break;
          case 'agency_id':
            contactData.agencyId = value;
            break;
          case 'id':
            contactData.originalId = value;
            break;
        }
      });
      
      if (contactData.name) {
        const existing = await prisma.contact.findFirst({
          where: {
            OR: [
              { email: contactData.email },
              { name: contactData.name }
            ]
          }
        });
        
        if (!existing) {
          await prisma.contact.create({
            data: {
              originalId: contactData.originalId,
              name: contactData.name,
              email: contactData.email,
              phone: contactData.phone,
              position: contactData.position,
              department: contactData.department,
              agencyId: contactData.agencyId
            }
          });
          imported++;
        }
      }
    }
    
    console.log(`Imported ${imported} contacts`);
  } catch (error) {
    console.error('Error importing contacts:', error);
  }
}

async function importAgenciesCSV(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    let imported = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const agencyData: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case 'name':
            agencyData.name = value;
            break;
          case 'type':
            agencyData.type = value;
            break;
          case 'state':
            agencyData.state = value;
            break;
          case 'website':
            agencyData.website = value;
            break;
          case 'population':
            agencyData.population = value;
            break;
          case 'phone':
            agencyData.phone = value;
            break;
          case 'mailing_address':
            agencyData.mailingAddress = value;
            break;
          case 'physical_address':
            agencyData.physicalAddress = value;
            break;
          case 'county':
            agencyData.county = value;
            break;
          case 'id':
            agencyData.originalId = value;
            break;
        }
      });
      
      if (agencyData.name) {
        const existing = await prisma.agency.findFirst({
          where: { name: agencyData.name }
        });
        
        if (!existing) {
          await prisma.agency.create({
            data: {
              originalId: agencyData.originalId,
              name: agencyData.name,
              type: agencyData.type,
              state: agencyData.state,
              website: agencyData.website,
              population: agencyData.population,
              phone: agencyData.phone,
              mailingAddress: agencyData.mailingAddress,
              physicalAddress: agencyData.physicalAddress,
              county: agencyData.county
            }
          });
          imported++;
        }
      }
    }
    
    console.log(`Imported ${imported} agencies`);
  } catch (error) {
    console.error('Error importing agencies:', error);
  }
}

importFromDataFolder()
  .then(() => {
    console.log('Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });