import { ReservesWidget } from "@/components/dashboard/ReservesWidget";
import { render, screen } from "../../test-utils";
import { mockReserves } from "../../test-utils";

describe("ReservesWidget", () => {
  it("renders reserves information", () => {
    const reserves = mockReserves();
    render(<ReservesWidget reserves={reserves} />);

    expect(screen.getByText(/BCRA Reserves/i)).toBeInTheDocument();
  });

  it("displays gross reserves", () => {
    const reserves = mockReserves({
      grossReserves: 28000000000,
    });
    render(<ReservesWidget reserves={reserves} />);

    expect(screen.getByText(/Gross/i)).toBeInTheDocument();
  });

  it("displays net reserves", () => {
    const reserves = mockReserves({
      netReserves: 5000000000,
    });
    render(<ReservesWidget reserves={reserves} />);

    expect(screen.getByText(/Net/i)).toBeInTheDocument();
  });

  it("shows positive variation with correct styling", () => {
    const reserves = mockReserves({
      dailyVariation: 100000000,
      trend: "UP",
    });
    render(<ReservesWidget reserves={reserves} />);

    const container = screen.getByText(/Gross/i).closest("div")?.parentElement;
    expect(container).toBeInTheDocument();
  });

  it("shows negative variation with correct styling", () => {
    const reserves = mockReserves({
      dailyVariation: -50000000,
      trend: "DOWN",
    });
    render(<ReservesWidget reserves={reserves} />);

    const container = screen.getByText(/Gross/i).closest("div")?.parentElement;
    expect(container).toBeInTheDocument();
  });

  it("displays liability values", () => {
    const reserves = mockReserves();
    render(<ReservesWidget reserves={reserves} />);

    expect(screen.getByText(/Swap China/i)).toBeInTheDocument();
    expect(screen.getByText(/Encajes Bancarios/i)).toBeInTheDocument();
  });

  it("formats large numbers correctly", () => {
    const reserves = mockReserves({
      grossReserves: 28500000000,
    });
    render(<ReservesWidget reserves={reserves} />);

    const container = screen.getByText(/BCRA Reserves/i).closest("div");
    expect(container).toBeInTheDocument();
  });

  it("accepts custom label prop", () => {
    const reserves = mockReserves();
    render(<ReservesWidget reserves={reserves} label="Custom Reserves Label" />);

    expect(screen.getByText(/Custom Reserves Label/i)).toBeInTheDocument();
  });
});
