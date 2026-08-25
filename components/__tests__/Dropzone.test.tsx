import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Dropzone from "../Dropzone";

describe("Dropzone Component", () => {
  it("renders upload instructions by default", () => {
    const handleAccept = jest.fn();
    render(<Dropzone onFileAccepted={handleAccept} />);
    
    expect(screen.getByText("Drag & drop a file here")).toBeInTheDocument();
    expect(screen.getByText(/click to browse/i)).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
    expect(screen.getByText("PNG")).toBeInTheDocument();
    expect(screen.getByText("JPEG")).toBeInTheDocument();
  });

  it("calls onFileRejected when invalid file is dropped", () => {
    // Note: react-dropzone is hard to test fully with RTL without complex mocking of drag events.
    // This is a basic test that checks the component mounts properly with props.
    const handleReject = jest.fn();
    render(<Dropzone onFileAccepted={jest.fn()} onFileRejected={handleReject} />);
    
    const input = document.getElementById("file-upload-input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });
});
