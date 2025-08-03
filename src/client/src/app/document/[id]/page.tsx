"use client";
import MF_Document_Layout from "@/modules-features/document/MF_Document_Layout";
import React from "react";

interface IProp {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: IProp) {
  const { id } = React.use(params);
  return (
    <>
      <MF_Document_Layout id={id} />
    </>
  );
}
