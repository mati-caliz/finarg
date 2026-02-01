import { Input } from "@/components/ui/input";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Input", () => {
  it("renders correctly", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    const input = screen.getByPlaceholderText(/type here/i);
    await user.type(input, "Hello World");

    expect(input).toHaveValue("Hello World");
  });

  it("handles different input types", () => {
    const { rerender } = render(<Input type="text" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "text");

    rerender(<Input type="email" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "email");

    rerender(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "password");

    rerender(<Input type="number" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "number");
  });

  it("can be disabled", async () => {
    const user = userEvent.setup();
    render(<Input disabled placeholder="Disabled" />);

    const input = screen.getByPlaceholderText(/disabled/i);
    expect(input).toBeDisabled();

    await user.type(input, "test");
    expect(input).toHaveValue("");
  });

  it("applies custom className", () => {
    render(<Input className="custom-class" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveClass("custom-class");
  });

  it("handles onChange events", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<Input onChange={handleChange} placeholder="Input" />);

    await user.type(screen.getByPlaceholderText(/input/i), "a");
    expect(handleChange).toHaveBeenCalled();
  });

  it("handles number input correctly", async () => {
    const user = userEvent.setup();
    render(<Input type="number" placeholder="Amount" />);

    const input = screen.getByPlaceholderText(/amount/i);
    await user.type(input, "12345");

    expect(input).toHaveValue(12345);
  });
});
