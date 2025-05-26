"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface BusinessDetails {
  businessName: string;
  abn: string;
  address: string;
  bankName: string;
  bsb: string;
  accountNumber: string;
  logo?: string;
}

interface BusinessSetupFormProps {
  onSaveDetails: (details: BusinessDetails) => void;
  initialDetails?: BusinessDetails;
}

const defaultBusinessDetails: BusinessDetails = {
  businessName: "",
  abn: "",
  address: "",
  bankName: "",
  bsb: "",
  accountNumber: "",
  logo: "",
};

export default function BusinessSetupForm({
  onSaveDetails,
  initialDetails = defaultBusinessDetails,
}: BusinessSetupFormProps) {
  // Check localStorage for saved business details on component mount
  React.useEffect(() => {
    const savedDetails = localStorage.getItem("businessDetails");
    if (
      savedDetails &&
      Object.keys(businessDetails).every(
        (key) => !businessDetails[key as keyof BusinessDetails],
      )
    ) {
      try {
        const parsedDetails = JSON.parse(savedDetails);
        setBusinessDetails(parsedDetails);
        if (parsedDetails.logo) {
          setLogoPreview(parsedDetails.logo);
        }
        console.log("✅ Loaded business details from localStorage");
      } catch (e) {
        console.error("Error parsing saved business details", e);
      }
    }
  }, []);
  const [businessDetails, setBusinessDetails] =
    useState<BusinessDetails>(initialDetails);
  const [errors, setErrors] = useState<
    Partial<Record<keyof BusinessDetails, string>>
  >({});
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialDetails.logo || null,
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setBusinessDetails((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name as keyof BusinessDetails]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match("image.*")) {
      setErrors((prev) => ({ ...prev, logo: "Please upload an image file" }));
      return;
    }

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoPreview(result);
      setBusinessDetails((prev) => ({ ...prev, logo: result }));
      setErrors((prev) => ({ ...prev, logo: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BusinessDetails, string>> = {};

    if (!businessDetails.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (!businessDetails.abn.trim()) {
      newErrors.abn = "ABN/ACN is required";
    } else if (!/^\d{9,11}$/.test(businessDetails.abn.replace(/\s/g, ""))) {
      newErrors.abn = "Please enter a valid ABN/ACN (9-11 digits)";
    }

    if (!businessDetails.address.trim()) {
      newErrors.address = "Business address is required";
    }

    if (!businessDetails.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    if (!businessDetails.bsb.trim()) {
      newErrors.bsb = "BSB is required";
    } else if (!/^\d{6}$/.test(businessDetails.bsb.replace(/\-/g, ""))) {
      newErrors.bsb = "Please enter a valid BSB (6 digits)";
    }

    if (!businessDetails.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (
      !/^\d{6,10}$/.test(businessDetails.accountNumber.replace(/\s/g, ""))
    ) {
      newErrors.accountNumber =
        "Please enter a valid account number (6-10 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSaveDetails(businessDetails);
    }
  };

  return (
    <Card className="w-full bg-card border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Business Details Setup
        </CardTitle>
        <CardDescription>
          Enter your business information to be displayed on invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              name="businessName"
              value={businessDetails.businessName}
              onChange={handleInputChange}
              placeholder="Your Business Name"
              className={errors.businessName ? "border-destructive" : ""}
            />
            {errors.businessName && (
              <p className="text-sm text-destructive">{errors.businessName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abn">ABN/ACN</Label>
            <Input
              id="abn"
              name="abn"
              value={businessDetails.abn}
              onChange={handleInputChange}
              placeholder="e.g. 12 345 678 901"
              className={errors.abn ? "border-destructive" : ""}
            />
            {errors.abn && (
              <p className="text-sm text-destructive">{errors.abn}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Textarea
              id="address"
              name="address"
              value={businessDetails.address}
              onChange={handleInputChange}
              placeholder="Full business address"
              className={errors.address ? "border-destructive" : ""}
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                name="bankName"
                value={businessDetails.bankName}
                onChange={handleInputChange}
                placeholder="e.g. Commonwealth Bank"
                className={errors.bankName ? "border-destructive" : ""}
              />
              {errors.bankName && (
                <p className="text-sm text-destructive">{errors.bankName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bsb">BSB</Label>
              <Input
                id="bsb"
                name="bsb"
                value={businessDetails.bsb}
                onChange={handleInputChange}
                placeholder="e.g. 123-456"
                className={errors.bsb ? "border-destructive" : ""}
              />
              {errors.bsb && (
                <p className="text-sm text-destructive">{errors.bsb}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                value={businessDetails.accountNumber}
                onChange={handleInputChange}
                placeholder="e.g. 12345678"
                className={errors.accountNumber ? "border-destructive" : ""}
              />
              {errors.accountNumber && (
                <p className="text-sm text-destructive">
                  {errors.accountNumber}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Company Logo</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload logo
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      PNG, JPG or SVG (max 2MB)
                    </span>
                  </label>
                </div>
                {errors.logo && (
                  <p className="text-sm text-destructive mt-1">{errors.logo}</p>
                )}
              </div>

              {logoPreview && (
                <div className="w-24 h-24 relative border rounded-md overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmit} className="px-6">
          Save Business Details
        </Button>
      </CardFooter>
    </Card>
  );
}
