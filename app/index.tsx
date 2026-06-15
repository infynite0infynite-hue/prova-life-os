import { Redirect } from "expo-router";
import { useAppContext } from "@/context/AppContext";

export default function Index() {
  const { isLocked } = useAppContext();
  if (isLocked) return <Redirect href="/lock" />;
  return <Redirect href="/(tabs)/" />;
}
