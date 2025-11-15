import Header from "./components/customs/Header";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
