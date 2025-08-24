#!/usr/bin/env python3
import os

def split_vcf_file(input_file, max_contacts_per_file=500):
    """Split VCF file into smaller chunks for easier import"""
    
    with open(input_file, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Split by vCard boundaries
    vcards = content.split('BEGIN:VCARD')
    vcards = ['BEGIN:VCARD' + vcard for vcard in vcards[1:]]  # Skip empty first element
    
    # Create output directory
    output_dir = 'vcf_chunks'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Split into chunks
    total_files = 0
    for i in range(0, len(vcards), max_contacts_per_file):
        chunk = vcards[i:i + max_contacts_per_file]
        
        # Create filename
        file_num = (i // max_contacts_per_file) + 1
        output_file = os.path.join(output_dir, f'contacts_part_{file_num:02d}.vcf')
        
        # Write chunk to file
        with open(output_file, 'w', encoding='utf-8') as outfile:
            outfile.write('\n\n'.join(chunk))
        
        total_files += 1
        print(f"Created {output_file} with {len(chunk)} contacts")
    
    print(f"\nTotal files created: {total_files}")
    print(f"Total contacts: {len(vcards)}")
    print(f"You can now import these files one by one into iCloud.")

if __name__ == "__main__":
    split_vcf_file("contacts_from_csv.vcf", 500)
