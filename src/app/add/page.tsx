"use client";

import React from "react";
import { useDatabase } from "@/context/DatabaseContext";
import ARCForm from "@/components/ARCForm";

export default function AddARCPage() {
  const { addARC } = useDatabase();

  return (
    <>
      <title>Track New ARC | Next Chapter ARC Tracker</title>
      <meta name="description" content="Add a new Advance Reader Copy (ARC) to your tracker pipeline." />
      <ARCForm
        onSubmit={addARC}
        submitLabel="Add Book to Pipeline"
        title="Track New ARC"
      />
    </>
  );
}
