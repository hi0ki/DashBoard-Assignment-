import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const contactsFile = formData.get('contacts') as File;
    const agenciesFile = formData.get('agencies') as File;
    
    const results = {
      contactsImported: 0,
      agenciesImported: 0,
      errors: []
    };

    // Process contacts CSV
    if (contactsFile) {
      try {
        const contactsText = await contactsFile.text();
        const contactsLines = contactsText.split('\n');
        const contactsHeaders = contactsLines[0].split(',').map(h => h.trim().toLowerCase());
        
        for (let i = 1; i < contactsLines.length; i++) {
          const line = contactsLines[i].trim();
          if (!line) continue;
          
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const contactData: any = {};
          
          contactsHeaders.forEach((header, index) => {
            const value = values[index] || '';
            switch (header) {
              case 'name':
              case 'full name':
              case 'contact name':
                contactData.name = value;
                break;
              case 'email':
              case 'email address':
                contactData.email = value;
                break;
              case 'phone':
              case 'phone number':
              case 'mobile':
                contactData.phone = value;
                break;
              case 'agency':
              case 'company':
              case 'organization':
                contactData.agency = value;
                break;
              case 'position':
              case 'title':
              case 'job title':
              case 'role':
                contactData.position = value;
                break;
              case 'notes':
              case 'description':
                contactData.notes = value;
                break;
            }
          });
          
          if (contactData.name) {
            try {
              // Check if contact already exists
              const existing = await prisma.contact.findFirst({
                where: {
                  OR: [
                    { email: contactData.email },
                    { name: contactData.name, phone: contactData.phone }
                  ]
                }
              });
              
              if (!existing) {
                await prisma.contact.create({
                  data: contactData
                });
                results.contactsImported++;
              }
            } catch (error) {
              results.errors.push(`Error importing contact ${contactData.name}: ${error}`);
            }
          }
        }
      } catch (error) {
        results.errors.push(`Error processing contacts file: ${error}`);
      }
    }

    // Process agencies CSV
    if (agenciesFile) {
      try {
        const agenciesText = await agenciesFile.text();
        const agenciesLines = agenciesText.split('\n');
        const agenciesHeaders = agenciesLines[0].split(',').map(h => h.trim().toLowerCase());
        
        for (let i = 1; i < agenciesLines.length; i++) {
          const line = agenciesLines[i].trim();
          if (!line) continue;
          
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const agencyData: any = {};
          
          agenciesHeaders.forEach((header, index) => {
            const value = values[index] || '';
            switch (header) {
              case 'name':
              case 'agency name':
              case 'company name':
                agencyData.name = value;
                break;
              case 'description':
              case 'about':
                agencyData.description = value;
                break;
              case 'website':
              case 'url':
                agencyData.website = value;
                break;
              case 'industry':
              case 'sector':
                agencyData.industry = value;
                break;
              case 'size':
              case 'company size':
              case 'employees':
                agencyData.size = value;
                break;
              case 'location':
              case 'address':
              case 'city':
                agencyData.location = value;
                break;
            }
          });
          
          if (agencyData.name) {
            try {
              // Check if agency already exists
              const existing = await prisma.agency.findFirst({
                where: { name: agencyData.name }
              });
              
              if (!existing) {
                await prisma.agency.create({
                  data: agencyData
                });
                results.agenciesImported++;
              }
            } catch (error) {
              results.errors.push(`Error importing agency ${agencyData.name}: ${error}`);
            }
          }
        }
      } catch (error) {
        results.errors.push(`Error processing agencies file: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      ...results
    });

  } catch (error) {
    console.error('Error importing CSV files:', error);
    return NextResponse.json(
      { error: 'Failed to import CSV files' },
      { status: 500 }
    );
  }
}