import colors from "@/styles/colors";
import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableHighlight,
  Modal,
  StyleSheet,
  Alert,
  Image,
} from "react-native";

//used the trefle api https://trefle.io/

type Plant = {
  id: number;
  common_name: string;
  scientific_name: string;
  image_url?: string;
  family?: string;
  genus?: string;

  main_species?: {
    growth?: {
      sunlight?: string[];
      growth_rate?: string;
    };

    watering?: string;

    temperature_minimum?: {
      deg_f?: number;
    };

    duration?: string[];
  };
};

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export default function PlantSearch() {
  const [data, setData] = useState<Plant[]>([]);
  const [filteredData, setFilteredData] = useState<Plant[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Plant>(data[0]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch(`https://trefle.io/api/v1/plants?token=${API_KEY}`)
    
      .then((res) => {
        if (!res.ok) {
          throw new Error("API request failed");
        }
        
        return res.json();
      })

      .then((json) => {
        
        
        if (!json || !json.data) {
          throw new Error("Invalid API response");
        }

        setData(json.data);
        setFilteredData(json.data);
        setLoading(false);
      })

      .catch((err) => {
        console.error("FETCH ERROR:", err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);

    // Reset if empty
    if (text === "") {
      setFilteredData(data);
      return;
    }

    fetch(
  `https://trefle.io/api/v1/plants/search?token=${API_KEY}&q=${text}&include=main_species`
)
  .then((res) => res.json())
  .then((json) => {
    setFilteredData(json.data || []);
  });
    
  };

  const handleSelectPlant = (plant: Plant) => {
    
    setSelected(plant);
    setVisible(true);
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View>
      <TextInput
        placeholder="Search plants..."
        value={query}
        onChangeText={handleSearch}
        style={{
          borderWidth: 1,
          margin: 10,
          padding: 10,
          borderRadius: 10,
          borderColor: colors.secondary,
        }}
      />
      </View>

      {/* used the code from https://reactnative.dev/docs/modal for the modal*/}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setVisible(!visible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.text}>
              <View>
            <Text style={styles.detail}>Common Name: {selected?.common_name}</Text>
            <Text style={styles.detail}>Scientific Name: {selected?.scientific_name}</Text>
            <Text style={styles.detail}>Family: {selected?.family}</Text>
            <Text style={styles.detail}>Genus: {selected?.genus}</Text>
            </View>
            <View style={styles.exit}>
            <TouchableHighlight
              style={[styles.button, styles.buttonClose]}
              onPress={() => setVisible(!visible)}
            >
              <Text style={styles.textStyle}>X</Text>
            </TouchableHighlight>
            </View>
          </View>
            {/* used chat gpt on how to render the image only if the url is available
              https://chatgpt.com/share/69de7927-9f44-832e-a7d7-d5d46f6776c6 */}
            {selected?.image_url && (
              <Image
                source={{ uri: selected.image_url }}
                style={styles.image}
              />
            )}
            
          </View>
        </View>
      </Modal>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No plants found
          </Text >
        }
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <TouchableHighlight onPress={() => handleSelectPlant(item)}>
              <View>
                <Text style={styles.detail}>
                  {item.common_name || "No common name"}
                </Text>
                <Text style={{ color: colors.secondary }}>{item.scientific_name}</Text>
              </View>
            </TouchableHighlight>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    flexDirection: 'row',
    alignItems: 'flex-start', 
    marginBottom: 10,
  },
  exit: {
    marginLeft: 10,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'center',
  },
  image: {
    width: 280,
    height: 290,
    borderRadius: 10,
  },
  button: {
    borderRadius: 40,
    paddingVertical: 5,
    paddingHorizontal: 7,
    elevation: 2,

  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: 'red',
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  detail: {
    color: colors.secondary,
    fontWeight: "bold",
    textAlign: "left",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "left",
  },
});
