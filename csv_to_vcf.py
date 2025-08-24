#!/usr/bin/env python3
import csv
import re

def clean_phone_number(phone):
    """Clean and format phone number with +90 prefix"""
    if not phone or phone.strip() == '':
        return None
    
    # Remove all non-digits
    phone = re.sub(r'[^0-9]', '', phone.strip())
    
    # Add +90 if not already present
    if phone.startswith('90'):
        phone = '+' + phone
    elif phone.startswith('0'):
        phone = '+90' + phone[1:]
    else:
        phone = '+90' + phone
    
    return phone

def extract_names(company_name):
    """Extract first and last name from company name (first 3 words as first name, next 3 as last name)"""
    words = company_name.split()
    
    # First 3 words as first name
    first_name = ' '.join(words[:3]) if len(words) >= 3 else ' '.join(words)
    
    # Next 3 words as last name
    last_name = ' '.join(words[3:6]) if len(words) > 3 else ''
    
    # If no last name, use a part of first name
    if not last_name and len(words) > 1:
        last_name = words[-1]
        first_name = ' '.join(words[:-1])
    
    return first_name, last_name

def create_vcard(company_name, phone, email):
    """Create a single vCard entry"""
    first_name, last_name = extract_names(company_name)
    phone_clean = clean_phone_number(phone)
    
    # Create vCard
    vcard = []
    vcard.append("BEGIN:VCARD")
    vcard.append("VERSION:3.0")
    
    # Formatted name (display name)
    vcard.append(f"FN:{company_name}")
    
    # Name components (Family;Given;Additional;Prefix;Suffix)
    vcard.append(f"N:{last_name};{first_name};;;")
    
    # Organization
    vcard.append(f"ORG:{company_name}")
    
    # Phone number
    if phone_clean:
        vcard.append(f"TEL;TYPE=WORK,VOICE:{phone_clean}")
    
    # Email
    if email and email.strip():
        vcard.append(f"EMAIL;TYPE=WORK:{email.strip()}")
    
    vcard.append("END:VCARD")
    
    return '\n'.join(vcard)

def csv_to_vcf(csv_file, vcf_file):
    """Convert CSV to VCF format"""
    vcards = []
    
    with open(csv_file, 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        
        for row in csv_reader:
            company_name = row['Yetki Belgesi Unvanı'].strip()
            phone = row['Telefon'].strip() if row['Telefon'] else ''
            email = row['E-posta'].strip() if row['E-posta'] else ''
            
            # Skip empty entries
            if not company_name:
                continue
            
            # Create vCard
            vcard = create_vcard(company_name, phone, email)
            vcards.append(vcard)
    
    # Write to file
    with open(vcf_file, 'w', encoding='utf-8') as file:
        file.write('\n\n'.join(vcards))
    
    print(f"Converted {len(vcards)} contacts to {vcf_file}")
    return len(vcards)

if __name__ == "__main__":
    count = csv_to_vcf("osgb_numbers.csv", "contacts_from_csv.vcf")
    print(f"Total contacts created: {count}")
