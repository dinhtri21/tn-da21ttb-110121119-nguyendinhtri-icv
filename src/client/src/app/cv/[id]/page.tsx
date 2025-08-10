"use client";
import MF_CV_Layout from "@/modules-features/MF_CV/MF_CV_Layout";
import React from "react";

interface IProp {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: IProp) {
  const { id } = React.use(params);
  return (
    <>
      <MF_CV_Layout id={id} />
    </>
  );
}
