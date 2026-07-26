import { AnnotatedSeriesChart, type ChartSeries } from "@/components/core";
import { render, screen } from "@testing-library/react";

function pathsOf(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("path")).map(
    (path) => path.getAttribute("d") ?? "",
  );
}

function series(name: string, values: (number | null)[]): ChartSeries {
  return { name, data: values.map((value) => ({ v: value })) };
}

describe("AnnotatedSeriesChart", () => {
  it("breaks the line where the series has no data", () => {
    const { container } = render(
      <AnnotatedSeriesChart series={[series("bcra", [10, null, 30])]} gapFill={false} />,
    );

    const [linePath] = pathsOf(container);
    expect(linePath?.match(/M/g)).toHaveLength(2);
  });

  it("draws nothing for a series without a single value", () => {
    const { container } = render(
      <AnnotatedSeriesChart series={[series("bcra", [null, null])]} gapFill={false} />,
    );

    expect(pathsOf(container)).toEqual([""]);
  });

  it("paints the gap band only where both sources measured", () => {
    const { container } = render(
      <AnnotatedSeriesChart
        series={[series("bcra", [10, 20, 30, 40]), series("datosgobar", [null, null, 33, 44])]}
      />,
    );

    const [gapPath] = pathsOf(container);
    expect(gapPath?.match(/M/g)).toHaveLength(1);
    expect(screen.getByText("Brecha entre mediciones")).toBeInTheDocument();
  });

  it("hides the gap legend when the sources never overlap", () => {
    render(
      <AnnotatedSeriesChart
        series={[series("bcra", [10, 20, null, null]), series("datosgobar", [null, null, 33, 44])]}
      />,
    );

    expect(screen.queryByText("Brecha entre mediciones")).not.toBeInTheDocument();
  });
});
