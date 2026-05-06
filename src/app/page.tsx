import { role } from "@/lib/data";
import { redirect } from "next/navigation";

const Homepage = () => {
  if (role) {
    redirect(`/dashboard/${role}`);
  }
  return <div className="">Homepage</div>;
};

export default Homepage;