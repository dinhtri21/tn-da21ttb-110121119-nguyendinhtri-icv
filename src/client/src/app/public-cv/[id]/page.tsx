"use client";
import MF_PublicCV_Layout from "@/modules-features/MF_PublicCV/MF_PublicCV_Layout";
import React from "react";

interface IProp {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: IProp) {
  const { id } = React.use(params);
  return (
    <>
      <MF_PublicCV_Layout id={id} />
    </>
  );
}
