'use client';

export const projectsData = [
  {
    "customer": "Kinder Morgan",
    "sites": [
      {
        "plant_name": "Arlington RNG",
        "city": "Arlington",
        "state": "TX",
        "latitude": 32.7357,
        "longitude": -97.1081,
        "image_url": "data:image/jpeg;base64,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",
        "summary": "State-of-the-art facility by Mas Energy, processes 3,000 SCFM of waste gas (expandable to 5,100 SCFM), converting landfill and wastewater gases into RNG. Opened in 2019, $20 million investment."
      },
      {
        "plant_name": "Autumn Hills RNG",
        "city": "Zeeland",
        "state": "MI",
        "latitude": 42.8014,
        "longitude": -86.0181,
        "image_url": "https://www.kindermorgan.com/getmedia/11b36b29-2ae0-4980-bf7f-50d59f977e01/Autumn-Hills-RNG-Header.png?width=800&height=530&ext=.png",
        "summary": "Kinder Morgan RNG's first Michigan plant, captures landfill gas, produces 0.8 Bcf RNG annually, displacing over 4.1 million gallons of diesel and reducing GHG emissions by ~46,659 tons/year."
      },
      {
        "plant_name": "Hartland Landfill RNG",
        "city": "Victoria",
        "state": "BC",
        "latitude": 48.4284,
        "longitude": -123.3656,
        "image_url": "https://media-s3-us-east-1.ceros.com/ghd/images/2023/11/03/018ed89e190327d1b246cdf8fc923252/hartland-hero.jpg",
        "summary": "Converts landfill gas to RNG for FortisBC, reducing regional GHG emissions by 450,000 tonnes CO2 over 25 years; delivers 200,000 GJ/year of RNG, eliminating ~264,000 tonnes GHG over contract."
      },
      {
        "plant_name": "Indy High BTU RNG",
        "city": "Indianapolis",
        "state": "IN",
        "latitude": 39.7684,
        "longitude": -86.1581,
        "image_url": "https://edlenergy.com/wp-content/uploads/2020/03/Southside-EDL-2-28-2020_181-scaled.jpg",
        "summary": "Indiana's largest RNG plant, commissioned 2020, converts landfill gas to 680,000 mmBtu/year of RNG, displacing 8–12 million gallons of diesel and abating 41,000 tons CO2-e annually."
      },
      {
        "plant_name": "Liberty RNG",
        "city": "Monticello",
        "state": "IN",
        "latitude": 40.7453,
        "longitude": -86.7645,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5P2TgqiIdJEcYkJmTFL7Vf3JIAbFNg8AnQg&s",
        "summary": "State-of-the-art plant, operational since Oct 2023, captures landfill gas, adds 1.5 Bcf RNG/year, part of three-plant Indiana cluster reducing GHG emissions by ~280,000 tons/year."
      },
      {
        "plant_name": "Prairie View RNG",
        "city": "Wyatt",
        "state": "IN",
        "latitude": 41.5917,
        "longitude": -86.1636,
        "image_url": "https://www.kindermorgan.com/WWWKM/media/Kinetrex/images/Prairie-View-RNG-blog-image.png",
        "summary": "Operational since Dec 2023, captures landfill gas, produces 0.8 Bcf RNG/year, part of Indiana trio displacing 28 million gallons diesel and reducing GHG by ~280,000 tons/year."
      },
      {
        "plant_name": "Twin Bridges RNG",
        "city": "Danville",
        "state": "IN",
        "latitude": 39.7617,
        "longitude": -86.5267,
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvUVAzBOuZI2Gy5baBGq6vjrhP5olHk2iwiA&s",
        "summary": "Launched mid-2023, captures landfill gas, adds 1.5 Bcf RNG/year, first of three Indiana plants totaling 3.9 Bcf RNG/year, displacing 28 million gallons diesel and cutting GHG by ~280,000 tons/year."
      }
    ]
  },
  {
    "customer": "Novilla",
    "sites": [
      {
        "plant_name": "GreenFlame BioEnergy",
        "city": "Wisconsin",
        "state": "WI",
        "latitude": 44.5,
        "longitude": -89.5,
        "image_url": "https://static.wixstatic.com/media/6a634b_6056c66d4e684bca8a304e07fd790fba~mv2.jpg/v1/fill/w_762,h_380,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/6a634b_6056c66d4e684bca8a304e07fd790fba~mv2.jpg",
        "summary": "Located at Trillium Hill Farm in Wisconsin, GreenFlame BioEnergy RNG began construction in July 2022 and started commercial operations in October 2023. The project captures biogas from dairy operations and upgrades it to renewable natural gas."
      },
      {
        "plant_name": "Buckhorn",
        "city": "Wisconsin",
        "state": "WI",
        "latitude": 44.5,
        "longitude": -89.5,
        "image_url": "https://static.wixstatic.com/media/6a634b_0ff048c5bf604259a1394e69632f0aa3~mv2.jpg/v1/fill/w_736,h_536,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/6a634b_0ff048c5bf604259a1394e69632f0aa3~mv2.jpg",
        "summary": "At Lynn Brothers Dairy in Wisconsin, Buckhorn RNG began construction in fall 2023 and is expected to begin commercial operations in November 2024. The facility will convert dairy biogas into pipeline-quality RNG."
      },
      {
        "plant_name": "Farmstead RNG",
        "city": "Wisconsin",
        "state": "WI",
        "latitude": 44.5,
        "longitude": -89.5,
        "image_url": "https://static.wixstatic.com/media/6a634b_16660eff6a47476592db05c5e5cd7660~mv2.jpg/v1/crop/x_643,y_0,w_3389,h_1843/fill/w_748,h_406,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/6a634b_16660eff6a47476592db05c5e5cd7660~mv2.jpg",
        "summary": "Farmstead RNG project in Wisconsin is scheduled to start construction in August 2024, following a contract date of July 2024, focusing on upgrading dairy-derived biogas to renewable natural gas."
      },
      {
        "plant_name": "Red Leaf",
        "city": "Michigan",
        "state": "MI",
        "latitude": 44.182205,
        "longitude": -84.506836,
        "image_url": "https://static.wixstatic.com/media/6a634b_7b4335ff07fc4ed1973f090e3f81bd1e~mv2.jpg/v1/crop/x_0,y_199,w_7149,h_4099/fill/w_764,h_438,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/red%20leaf%203_JPG.jpg",
        "summary": "Red Leaf RNG at Maple Row Dairy in Michigan started construction in August 2022 and began commercial operations in October 2023. The project upgrades dairy-derived biogas to renewable natural gas."
      },
      {
        "plant_name": "West Branch",
        "city": "Iowa",
        "state": "IA",
        "latitude": 42.032974,
        "longitude": -93.581543,
        "image_url": "https://static.wixstatic.com/media/6a634b_cc282b5b5d154e549193fe5d3c49e9e5~mv2.jpg/v1/crop/x_0,y_427,w_4032,h_2170/fill/w_758,h_408,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/hoogland%20corn.jpg",
        "summary": "Serving Hoogland, Maassen, and Highland Dairy in Iowa, West Branch RNG began construction in Q1 2023 and is scheduled for commercial operations in September 2024. The plant will process dairy biogas into RNG for pipeline injection."
      },
      {
        "plant_name": "Five Shot RNG at East River Genetics",
        "city": "South Dakota",
        "state": "SD",
        "latitude": 43.536388,
        "longitude": -96.731667,
        "image_url": "https://static.wixstatic.com/media/6a634b_31803303799f40e1a16d6cc02d64d52c~mv2.jpg/v1/crop/x_0,y_164,w_2016,h_896/fill/w_746,h_328,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/6a634b_31803303799f40e1a16d6cc02d64d52c~mv2.jpg",
        "summary": "Five Shot RNG at East River Genetics in South Dakota is set to start construction in summer 2024. The project will produce RNG from livestock biogas for commercial use."
      },
      {
        "plant_name": "Moccasin Creek RNG at Warner Dairy",
        "city": "South Dakota",
        "state": "SD",
        "latitude": 43.536388,
        "longitude": -96.731667,
        "image_url": "https://static.wixstatic.com/media/6a634b_687a5538544940358eaa4f332ada9e2e~mv2.jpg/v1/crop/x_0,y_0,w_7647,h_4041/fill/w_746,h_398,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Moccasin%20Creek.jpg",
        "summary": "Moccasin Creek RNG at Warner Dairy in South Dakota is also scheduled to begin construction in summer 2024. The facility will convert dairy biogas to renewable natural gas."
      },
      {
        "plant_name": "Bellevue RNG Project at Pleasant Valley Farms",
        "city": "Vermont",
        "state": "VT",
        "latitude": 44.0,
        "longitude": -72.699997,
        "image_url": "https://static.wixstatic.com/media/6a634b_f45078dbbd9f425e88f4c0db954baf26~mv2.jpg/v1/fill/w_612,h_458,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Bellevue%20Marketing%20Compressed_JPG.jpg",
        "summary": "Bellevue RNG Project at Pleasant Valley Farms in Vermont started with a contract date in December 2022, construction in Summer 2024, and aims for commercial operations in Summer 2025."
      }
    ]
  },
  {
    "customer": "Demo-RNG",
    "sites": [
      {
        "plant_name": "GreenFlame BioEnergy",
        "city": "Indianapolis",
        "state": "IN",
        "latitude": 39.7684,
        "longitude": -86.1581,
        "image_url": "https://www.wastetodaymagazine.com/remote/aHR0cHM6Ly9naWVjZG4uYmxvYi5jb3JlLndpbmRvd3MubmV0L2ZpbGV1cGxvYWRzL2ltYWdlLzIwMjEvMDcvMjAvc291dGhzaGVsYnlybmctMTAwMi5qcGc.8MApqbi0IiY.jpg?format=webp",
        "summary": "Advanced biogas facility processing 1,200 SCFM of waste gas from multiple sources, utilizing proprietary GreenFlame technology for higher efficiency conversion. Operational since 2022, the plant produces 0.5 Bcf RNG annually while reducing GHG emissions by approximately 25,000 tons/year."  
      },
      {
        "plant_name": "EcoMethane Hub",
        "city": "Victoria",
        "state": "BC",
        "latitude": 48.4284,
        "longitude": -123.3656,
        "image_url": "https://kupperengineering.com/wp-content/uploads/2018/06/biogas_plant_1-1-1024x683.jpg",
        "summary": "Centralized methane processing facility serving multiple municipal waste sources, commissioned in 2023. Features innovative carbon capture technology, processing capacity of 2,500 SCFM, and delivers 180,000 GJ/year of renewable natural gas while eliminating approximately 32,000 tonnes of GHG emissions annually."  
      }
    ]
  }
];
