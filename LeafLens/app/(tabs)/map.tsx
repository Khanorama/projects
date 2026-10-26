import React, { useCallback, useEffect, useRef, useState } from "react";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import {
  StyleSheet,
  View,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import { supabase } from "@/utils/supabase";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import colors from "@/styles/colors";

function PhotoMarker({ photo, index }: { photo: any; index: number }) {
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const lat = Number(photo.latitude);
  const lng = Number(photo.longitude);
  if (isNaN(lat) || isNaN(lng)) return null;

  return (
    <Marker key={index} coordinate={{ latitude: lat, longitude: lng }}>
      <Image source={{ uri: photo.image_url }} style={styles.markerImage} />
      <Callout>
        <View style={styles.callout}>
          <Image
            source={{ uri: photo.image_url }}
            style={[
              styles.calloutImageBase,
              aspectRatio ? { aspectRatio } : { height: 120 },
            ]}
            resizeMode="cover"
            onLoad={(e) => {
              const { width, height } = e.nativeEvent.source;
              if (width && height) setAspectRatio(width / height);
            }}
          />
          <Text style={styles.caption}>{photo.caption || "No caption"}</Text>
        </View>
      </Callout>
    </Marker>
  );
}

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);

  const [region, setRegion] = useState<Region | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { granted } = await Location.requestForegroundPermissionsAsync();

        if (!granted) {
          console.log("Location permission denied");
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});

        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        });

        setLoading(false);
      } catch (err) {
        console.log("Location error:", err);
        setLoading(false);
      }
    })();
  }, []);

  const fetchPhotos = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("photos").select("*");
      if (error) { console.log("Fetch error:", error); return; }
      setPhotos(data || []);
    } catch (err) {
      console.log("Fetch crash:", err);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPhotos();
    setRefreshing(false);
  };


  useEffect(() => {
    if (photos.length > 0 && mapRef.current) {
      const coords = photos
        .map((p) => ({
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
        }))
        .filter(
          (c) => !isNaN(c.latitude) && !isNaN(c.longitude)
        );

      if (coords.length > 0) {
        // map needs a tick to finish rendering before fitToCoordinates works
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(coords, {
            edgePadding: {
              top: 50,
              right: 50,
              bottom: 50,
              left: 50,
            },
            animated: true,
          });
        }, 500);
      }
    }
  }, [photos]);

  if (loading || !region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        showsUserLocation={true}
      >

        {photos.map((p, i) => (
          <PhotoMarker key={i} photo={p} index={i} />
        ))}
      </MapView>

      <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh} activeOpacity={0.8}>
        {refreshing
          ? <ActivityIndicator size="small" color={colors.lightbackground} />
          : <MaterialCommunityIcons name="refresh" size={24} color={colors.lightbackground} />
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  map: {
    width: "100%",
    height: "100%",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  markerImage: {
    width: 45,
    height: 45,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "white",
  },

  callout: {
    width: 200,
    alignItems: "center",
  },

  calloutImageBase: {
    width: 180,
    borderRadius: 10,
    marginBottom: 8,
    overflow: "hidden",
  },

  caption: {
    fontSize: 14,
    textAlign: "center",
  },

  refreshBtn: {
    position: "absolute",
    bottom: 24,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});