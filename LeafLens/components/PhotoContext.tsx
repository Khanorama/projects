import React, { createContext, useContext, useState, ReactNode } from "react";

export type Photo = {
  uri: string;
  latitude: number;
  longitude: number;
  caption: string;
};

type PhotoContextType = {
  photos: Photo[];
  addPhoto: (photo: Photo) => void;
};

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const PhotoProvider = ({ children }: Props) => {
  const [photos, setPhotos] = useState<Photo[]>([]);

  const addPhoto = (photo: Photo) => {
    setPhotos((prev) => [...prev, photo]);
  };

  return (
    <PhotoContext.Provider value={{ photos, addPhoto }}>
      {children}
    </PhotoContext.Provider>
  );
};

export const usePhotos = (): PhotoContextType => {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error("usePhotos must be used inside PhotoProvider");
  }
  return context;
};