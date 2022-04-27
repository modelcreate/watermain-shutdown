import { useContext } from "react";
import DataContext from "../context/DataContext";

export default function useData() {
  const context = useContext(DataContext);

  return context;
}
