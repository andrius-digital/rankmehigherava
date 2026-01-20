-- Insert Website Clients

-- Off Tint
INSERT INTO public.clients (
    name,
    company_name,
    email,
    phone,
    website_url,
    brand_voice,
    target_audience,
    primary_services,
    status,
    notes
) VALUES (
    'Off Tint',
    'Off Tint',
    'info@off-tint.com',
    '(312) 555-TINT',
    'https://off-tint.com',
    'Website Client',
    'Vehicle owners in Chicago looking for professional window tinting and automotive protection services',
    ARRAY['Window Tinting', 'Ceramic Coating', 'PPF Installation'],
    'ACTIVE',
    '{"location": "Chicago, IL", "industry": "Automotive Services"}'
) ON CONFLICT DO NOTHING;

-- Klean And Fresh Housekeeping LLC
INSERT INTO public.clients (
    name,
    company_name,
    email,
    phone,
    website_url,
    brand_voice,
    target_audience,
    primary_services,
    status,
    notes
) VALUES (
    'Klean And Fresh Housekeeping LLC',
    'Klean And Fresh Housekeeping LLC',
    'contact@kleanandfresh.com',
    '(619) 346-1985',
    'https://kleanandfresh.com',
    'Website Client',
    'Homeowners in San Diego seeking reliable cleaning services',
    ARRAY['Monthly Upkeep', 'Weekly Upkeep', 'Deep Clean', 'Kitchen Reset', 'Room Reset'],
    'ACTIVE',
    '{"location": "San Diego, CA", "industry": "Home Cleaning Services"}'
) ON CONFLICT DO NOTHING;

-- Property Refresh Maids
INSERT INTO public.clients (
    name,
    company_name,
    email,
    phone,
    website_url,
    brand_voice,
    target_audience,
    primary_services,
    status,
    notes
) VALUES (
    'Property Refresh Maids',
    'Property Refresh Maids',
    'propertyrefreshinc@gmail.com',
    '(224) 386-4836',
    'https://propertyrefreshmaids.com',
    'Website Client',
    'Homeowners in North Shore Chicago suburbs needing professional cleaning',
    ARRAY['Regular Cleaning', 'Deep Cleaning', 'Move In/Out', 'Post Construction'],
    'ACTIVE',
    '{"location": "Northbrook, IL", "industry": "House Cleaning Services", "serviceAreas": "Northbrook, Winnetka, Glencoe, Wilmette, Kenilworth, Evanston, Skokie, Niles, Northfield, Mt Prospect, Glenview, Deerfield, Riverwoods, Lincolnshire, Highland Park, Lake Forest, Lake Bluff, Vernon Hills, Mundelein, Long Grove, Buffalo Grove, Arlington Heights", "colors": "dark blue, light blue, white, gray"}'
) ON CONFLICT DO NOTHING;

-- Insert Funnel Client

-- Orange Crew Junk Removal
INSERT INTO public.clients (
    name,
    company_name,
    email,
    phone,
    brand_voice,
    target_audience,
    primary_services,
    status,
    notes
) VALUES (
    'Orange Crew Junk Removal',
    'Orange Crew Junk Removal',
    'info@orangecrewchicago.com',
    '(888) 308-7556',
    'Funnel Client',
    'Homeowners and businesses in Chicago needing junk removal services',
    ARRAY['Junk Removal', 'Lead Generation', 'Funnel Campaign'],
    'ACTIVE',
    '{"submission_type": "funnel", "dummy_domain": "orangecrewfunnel.rankmehigher.com", "live_domain": "", "location": "Chicago, IL", "address": "4747 W. Peterson Ave, Ste 407B, Chicago, IL 60646", "funnel_goal": "Generate leads for junk removal services", "main_offer": "Free On-Site Estimate", "logo_files": ["/orange-crew-logo.png"]}'
) ON CONFLICT DO NOTHING;
