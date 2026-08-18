import numpy as np
import pandas as pd

def generate_multi_hazard_dataset(n_samples: int = 5000, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic multi-hazard synthetic dataset representing meteorological,
    hydrological, and geophysical sensor readings correlated with disaster risk categories.
    """
    np.random.seed(random_state)
    
    # 1. Environmental base features
    rainfall_1h = np.random.exponential(scale=5.0, size=n_samples)
    rainfall_6h = rainfall_1h * np.random.uniform(2.0, 5.5, size=n_samples) + np.random.exponential(scale=10.0, size=n_samples)
    rainfall_24h = rainfall_6h * np.random.uniform(1.8, 3.8, size=n_samples) + np.random.exponential(scale=20.0, size=n_samples)
    
    # Elevation (meters above sea level)
    elevation = np.random.choice([15.0, 45.0, 120.0, 450.0, 950.0, 1400.0], size=n_samples, p=[0.25, 0.25, 0.2, 0.15, 0.1, 0.05])
    
    # River water level and danger threshold
    river_danger_level = np.random.uniform(3.5, 6.0, size=n_samples)
    river_water_level = np.random.uniform(0.5, 2.5, size=n_samples) + (rainfall_24h / 75.0) * np.random.uniform(0.8, 1.4, size=n_samples)
    river_water_level = np.minimum(river_water_level, river_danger_level + 3.0)
    
    # Soil moisture (0 - 100 %)
    soil_moisture = np.clip(np.random.uniform(20.0, 50.0, size=n_samples) + (rainfall_24h / 5.0), 10.0, 98.0)
    
    # Atmospheric temperature (C) and humidity (%)
    temperature = np.random.normal(loc=30.0, scale=6.0, size=n_samples)
    humidity = np.clip(np.random.normal(loc=65.0, scale=18.0, size=n_samples), 15.0, 99.0)
    
    # Wind speed and gusts (km/h)
    wind_speed = np.random.exponential(scale=15.0, size=n_samples)
    wind_gust = wind_speed * np.random.uniform(1.2, 1.9, size=n_samples)
    
    # Atmospheric pressure (hPa)
    atmospheric_pressure = 1013.25 - (wind_speed / 4.0) + np.random.normal(0, 3.0, size=n_samples)
    
    # Historical vulnerability index (0.0 to 1.0)
    historical_vulnerability = np.random.beta(2, 2, size=n_samples)
    population_density = np.random.uniform(500, 15000, size=n_samples)
    
    # Multi-hazard risk calculation formulas
    # Flood Index (0 - 100)
    flood_signal = (
        (rainfall_24h / 150.0) * 40.0 +
        (river_water_level / river_danger_level) * 35.0 +
        (soil_moisture / 100.0) * 15.0 +
        (1.0 - np.clip(elevation / 500.0, 0, 1)) * 10.0 +
        historical_vulnerability * 10.0
    )
    
    # Landslide Index (high elevation + high soil moisture + high rainfall)
    landslide_signal = (
        (rainfall_24h / 180.0) * 35.0 +
        (soil_moisture / 100.0) * 30.0 +
        (np.clip(elevation / 1000.0, 0, 1)) * 25.0 +
        historical_vulnerability * 10.0
    )
    
    # Cyclone Index (low pressure + high wind speed + high humidity)
    cyclone_signal = (
        (wind_speed / 120.0) * 45.0 +
        (np.clip((1013.25 - atmospheric_pressure) / 45.0, 0, 1)) * 35.0 +
        (humidity / 100.0) * 10.0 +
        historical_vulnerability * 10.0
    )
    
    # Heatwave Index (high temperature + high humidity or high consecutive heat)
    heatwave_signal = (
        (np.clip((temperature - 35.0) / 12.0, 0, 1)) * 55.0 +
        (humidity / 100.0) * 25.0 +
        (1.0 - (rainfall_24h / 50.0).clip(0, 1)) * 20.0
    )
    
    # Wildfire Index (high temperature + low humidity + high wind speed)
    wildfire_signal = (
        (np.clip((temperature - 32.0) / 15.0, 0, 1)) * 35.0 +
        (np.clip((50.0 - humidity) / 40.0, 0, 1)) * 35.0 +
        (wind_speed / 60.0) * 20.0 +
        (1.0 - (soil_moisture / 60.0).clip(0, 1)) * 10.0
    )
    
    # Composite Multi-Hazard Target
    # We assign primary hazard and risk category
    disaster_types = []
    risk_scores = []
    risk_categories = []
    
    for i in range(n_samples):
        signals = {
            "FLOOD": flood_signal[i],
            "LANDSLIDE": landslide_signal[i],
            "CYCLONE": cyclone_signal[i],
            "HEATWAVE": heatwave_signal[i],
            "WILDFIRE": wildfire_signal[i]
        }
        
        # Determine dominant hazard
        top_hazard = max(signals, key=signals.get)
        top_score = float(np.clip(signals[top_hazard] * np.random.uniform(0.9, 1.1), 0.0, 100.0))
        
        if top_score < 25.0:
            category = "LOW"
            hazard = "GENERAL"
        elif top_score < 50.0:
            category = "MODERATE"
            hazard = top_hazard
        elif top_score < 75.0:
            category = "HIGH"
            hazard = top_hazard
        else:
            category = "CRITICAL"
            hazard = top_hazard
            
        disaster_types.append(hazard)
        risk_scores.append(round(top_score, 2))
        risk_categories.append(category)
        
    df = pd.DataFrame({
        "rainfall_1h": np.round(rainfall_1h, 2),
        "rainfall_6h": np.round(rainfall_6h, 2),
        "rainfall_24h": np.round(rainfall_24h, 2),
        "elevation": np.round(elevation, 1),
        "river_water_level": np.round(river_water_level, 2),
        "river_danger_level": np.round(river_danger_level, 2),
        "soil_moisture": np.round(soil_moisture, 2),
        "temperature": np.round(temperature, 2),
        "humidity": np.round(humidity, 2),
        "wind_speed": np.round(wind_speed, 2),
        "wind_gust": np.round(wind_gust, 2),
        "atmospheric_pressure": np.round(atmospheric_pressure, 2),
        "historical_vulnerability": np.round(historical_vulnerability, 3),
        "population_density": np.round(population_density, 1),
        "disaster_type": disaster_types,
        "risk_score": risk_scores,
        "risk_category": risk_categories
    })
    
    return df

if __name__ == "__main__":
    df = generate_multi_hazard_dataset(5000)
    print(f"Generated {len(df)} samples.")
    print(df.head())
    print("\nCategory Distribution:\n", df['risk_category'].value_counts())
    print("\nDisaster Type Distribution:\n", df['disaster_type'].value_counts())
