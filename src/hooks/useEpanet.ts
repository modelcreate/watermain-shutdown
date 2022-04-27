import { useContext } from "react";
import EpanetContext from "../context/EpanetContext";

export default function useEpanet() {
  const context = useContext(EpanetContext);

  return context;
}
