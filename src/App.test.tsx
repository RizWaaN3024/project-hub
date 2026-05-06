import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the hub title so you can replace this with a real behavioral test", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /project hub lite/i })).toBeInTheDocument();
  });
});
